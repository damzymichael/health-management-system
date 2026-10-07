import { PrismaClient, RuleOperator, Severity } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rules = [
    { code: "BP_SYS_HIGH", label: "Systolic High", metric: "bpSystolic", operator: RuleOperator.GTE, threshold: 140, severity: Severity.HIGH },
    { code: "BP_DIA_HIGH", label: "Diastolic High", metric: "bpDiastolic", operator: RuleOperator.GTE, threshold: 90, severity: Severity.HIGH },
    { code: "BP_SYS_SEVERE", label: "Systolic Severe", metric: "bpSystolic", operator: RuleOperator.GTE, threshold: 160, severity: Severity.CRITICAL },
    { code: "BP_DIA_SEVERE", label: "Diastolic Severe", metric: "bpDiastolic", operator: RuleOperator.GTE, threshold: 110, severity: Severity.CRITICAL },
    { code: "TEMP_HIGH", label: "Temperature High", metric: "temperature", operator: RuleOperator.GTE, threshold: 38.0, severity: Severity.HIGH },
    { code: "TEMP_LOW", label: "Temperature Low", metric: "temperature", operator: RuleOperator.LTE, threshold: 35.0, severity: Severity.HIGH },
    { code: "PULSE_HIGH", label: "Pulse High", metric: "pulse", operator: RuleOperator.GTE, threshold: 120, severity: Severity.HIGH },
    { code: "PULSE_LOW", label: "Pulse Low", metric: "pulse", operator: RuleOperator.LTE, threshold: 50, severity: Severity.HIGH },
    { code: "GLUCOSE_HIGH", label: "Blood Sugar High", metric: "bloodSugar", operator: RuleOperator.GTE, threshold: 11.1, severity: Severity.HIGH },
  ];

  for (const rule of rules) {
    await prisma.alertRule.upsert({
      where: { code: rule.code },
      update: rule,
      create: rule,
    });
  }
  console.log("✅ Default Alert rules seeded.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
