import { mockBillingRepository } from "@/entities/billing/api/mock-billing-repository";

export const billingUseCases = {
  listPlansWithCounts: mockBillingRepository.listPlansWithCounts.bind(mockBillingRepository),
  createPlan: mockBillingRepository.createPlan.bind(mockBillingRepository),
  updatePlan: mockBillingRepository.updatePlan.bind(mockBillingRepository),
  setPlanStatus: mockBillingRepository.setPlanStatus.bind(mockBillingRepository),
  deletePlan: mockBillingRepository.deletePlan.bind(mockBillingRepository),
  listSubscriptions: mockBillingRepository.listSubscriptions.bind(mockBillingRepository),
  changeSubscriptionPlan: mockBillingRepository.changeSubscriptionPlan.bind(mockBillingRepository),
  extendSubscriptionPeriod:
    mockBillingRepository.extendSubscriptionPeriod.bind(mockBillingRepository),
  cancelSubscription: mockBillingRepository.cancelSubscription.bind(mockBillingRepository),
  registerManualPayment: mockBillingRepository.registerManualPayment.bind(mockBillingRepository),
  listInvoices: mockBillingRepository.listInvoices.bind(mockBillingRepository),
  listInvoicesByOrganization:
    mockBillingRepository.listInvoicesByOrganization.bind(mockBillingRepository),
};
