import puppeteer, { PDFOptions, PuppeteerLaunchOptions } from 'puppeteer';

interface GeneratePDFOptions {
  outputPath?: string;
  saveToFile?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  // Add other customizable options here
}

/**
 * Creates a pdf document from htmlContent.
 *
 * @param {string} htmlContent - The HTML content to be converted to a PDF.
 * @param {string} [outputPath] - The path to save the generated PDF if saveToFile is true.
 * @param {boolean} [saveToFile=false] - Optional flag to save the PDF to a file.
 *
 * @returns {Buffer} - The generated PDF as a buffer.
 */
async function generatePDF(
  htmlContent: string,
  options: GeneratePDFOptions
): Promise<Buffer> {
  const browserOptions: PuppeteerLaunchOptions = {
    headless: true,
    timeout: 0,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  const browser = await puppeteer.launch(browserOptions);
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfOptions: PDFOptions = {
    format: 'A4',
    margin: {
      top: '25mm',
      right: '25mm',
      bottom: '20mm',
      left: '25mm'
    },
    printBackground: true,
    displayHeaderFooter: !!options.headerTemplate || !!options.footerTemplate,
    headerTemplate: options.headerTemplate,
    footerTemplate: options.footerTemplate,
    ...(options.saveToFile && { path: options.outputPath })
  };

  const pdfBuffer = await page.pdf(pdfOptions);

  await browser.close();

  return pdfBuffer;
}

export { generatePDF };
