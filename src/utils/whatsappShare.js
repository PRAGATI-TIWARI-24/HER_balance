export const shareReportOnWhatsApp = ({ riskLevel, cycleLength, bmi, symptoms = [] }) => {
  const symptomText = symptoms.length > 0 ? symptoms.join(', ') : 'None reported';
  
  const message = `*🌸 HerBalance Clinical Screening Summary*\n` +
    `--------------------------------\n` +
    `*AI Risk Assessment:* ${riskLevel}\n` +
    `*Reported Cycle Gap:* ${cycleLength || 28} Days\n` +
    `*Calculated BMI:* ${bmi || 'N/A'}\n` +
    `*Key Markers:* ${symptomText}\n` +
    `--------------------------------\n` +
    `_Note: This is an AI-assisted baseline triage generated for doctor consultation preparation._\n` +
    `Generated via HerBalance Platform`;

  const encodedUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(encodedUrl, '_blank');
};