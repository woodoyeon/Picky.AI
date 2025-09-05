// ✅ src/utils/export-utils.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * 현재 미리보기 영역을 PNG로 캡처
 */
export async function exportAsPng(previewRef, fileName = "preview") {
  const canvas = await html2canvas(previewRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fff",
  });
  const imgData = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = imgData;
  link.download = `${fileName}.png`;
  link.click();
}

/**
 * 현재 미리보기 영역을 PDF로 내보내기
 */
export async function exportAsPdf(previewRef, fileName = "preview") {
  const canvas = await html2canvas(previewRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fff",
  });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(imgData);
  const ratio = imgProps.width / imgProps.height;
  const pdfWidth = pageWidth;
  const pdfHeight = pdfWidth / ratio;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${fileName}.pdf`);
}

/**
 * PNG + PDF를 ZIP으로 묶어서 다운로드
 */
export async function exportAsZip(previewRef, fileName = "template") {
  const canvas = await html2canvas(previewRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(imgData);
  const ratio = imgProps.width / imgProps.height;
  const pdfWidth = pageWidth;
  const pdfHeight = pdfWidth / ratio;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  const pdfBlob = pdf.output("blob");

  const zip = new JSZip();
  zip.file(`${fileName}.png`, imgData.split(",")[1], { base64: true });
  zip.file(`${fileName}.pdf`, pdfBlob);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${fileName}.zip`);
}

