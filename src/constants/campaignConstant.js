export const CAMPAIGN_STATUS_PENDING = "Pending"; // plea not accepted || startDate > currentDate
export const CAMPAIGN_STATUS_ACTIVE = "Active"; // plea accepted || direct created campaign by screen owner || after getting access from screen owner
export const CAMPAIGN_STATUS_DELETED = "Deleted"; // deleted by Ally or brand || endDate < current date
export const CAMPAIGN_STATUS_PAUSE = "Pause"; // pause by screen owner
export const CAMPAIGN_STATUS_REJECTED = "Rejected"; // pause by screen owner
export const CAMPAIGN_STATUS_COMPLETED = "Completed"; // when campaign.remainingSlots  = 0
export const CAMPAIGN_STATUS_HOLD = "Hold"; // slotPlayedPerDay >= screen.slotPalyPerDay

export const CAMPAIGN_TYPE_REGULAR = "Regular";
export const CAMPAIGN_TYPE_SPECIAL = "Cohort";

export const PENDING = "pending"
export const ACCEPTED = "accepted"
export const REJECTED = "rejected"
export const BUDGET = "budget"
export const FINAL = "final"
export const SCREEN = "screen"
export const PRIMARY_CAMPAIGN_MANAGER = "PrimaryCampaignManager";
export const SECONDARY_CAMPAIGN_MANAGER = "SecondaryCampaignManager";
export const PRIMARY_SCREEN_OWNER = "PrimaryScreenOwner"
export const CAMPAIGN_STATUS_PLEA_REQUEST_BUDGET_SENT = "PleaRequestBudgetSent"
export const CAMPAIGN_STATUS_PLEA_REQUEST_BUDGET_ACCEPTED = "PleaRequestBudgetAccepted"
export const CAMPAIGN_STATUS_PLEA_REQUEST_BUDGET_REJECTED = "PleaRequestBudgetRejected"
export const CAMPAIGN_STATUS_PLEA_REQUEST_SCREEN_APPROVAL_SENT = "PleaRequestScreenApprovalSent"
export const CAMPAIGN_STATUS_PLEA_REQUEST_SCREEN_APPROVAL_ACCEPTED = "PleaRequestScreenApprovalAccepted"
export const CAMPAIGN_STATUS_PLEA_REQUEST_SCREEN_APPROVAL_REJECTED = "PleaRequestScreenApprovalRejected"
export const CAMPAIGN_STATUS_PLEA_REQUEST_FINAL_APPROVAL_SENT = "PleaRequestFinalApprovalSent"
export const CAMPAIGN_STATUS_PLEA_REQUEST_FINAL_APPROVAL_ACCEPTED = "PleaRequestFinalApprovalAccepted"
export const CAMPAIGN_STATUS_PLEA_REQUEST_FINAL_APPROVAL_REJECTED = "PleaRequestFinalApprovalRejected"

export const BUDGET_PLEA = "BudgetPlea"
export const SCREEN_PLEA = "ScreenPlea"
export const FINAL_PLEA = "FinalPlea"

export const MAIL_SUBJECT = "Accept Plea Request"
export const MAIL_BODY = "Hi Sir , Someone has sent you plea requests . Please check them . The campaign Ids are :- "