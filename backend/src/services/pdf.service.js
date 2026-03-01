const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const BRAND_COLOR = '#E63946'; // Enterprise Red
const NAVY = '#1D3557';

exports.generatePreApprovalPDF = (loan, user, res) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

    // Stream Setup
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PreApproval_${loan.id.substring(0,8)}.pdf`);
    doc.pipe(res);

    // Branding Header
    const logoPath = path.join(__dirname, '../../public/logo.png');
    if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 45, { width: 50 });

    doc.fillColor(BRAND_COLOR).fontSize(18).font('Helvetica-Bold')
       .text('MORTGAGE PRE-APPROVAL CERTIFICATION', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fillColor(NAVY).fontSize(10).font('Helvetica')
       .text(`System ID: ${loan.id.toUpperCase()}`, { align: 'right' })
       .text(`Date of Issue: ${new Date().toLocaleDateString()}`, { align: 'right' });

    // Body
    doc.moveDown(2).fontSize(12).fillColor('black')
       .text(`Dear ${user.name || 'Applicant'},`)
       .moveDown()
       .text('Based on a preliminary review of your provided financial telemetry, our Automated Underwriting System has determined you are eligible for financing.');

    // Loan Parameters Box
    doc.moveDown(2);
    const yPos = doc.y;
    doc.rect(50, yPos, 512, 100).strokeColor(BRAND_COLOR).lineWidth(1).stroke();
    doc.font('Helvetica-Bold').text('LOAN SPECIFICATIONS', 70, yPos + 15);
    doc.font('Helvetica').fontSize(11)
       .text(`Loan Amount: $${(loan.amount || 0).toLocaleString()}`, 70, yPos + 40)
       .text(`LTV Ratio: ${loan.ltvRatio || 0}%`, 70, yPos + 55)
       .text(`DTI Ratio: ${loan.dtiRatio || 0}%`, 70, yPos + 70);

    // Footer Compliance
    doc.moveDown(6).fontSize(8).fillColor('grey').font('Helvetica-Oblique')
       .text('Disclaimer: This is not a binding commitment to lend. Final approval is subject to collateral appraisal and full income verification.', { align: 'center' });

    doc.end();
};