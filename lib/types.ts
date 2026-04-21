export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: string
  stripe_price_id: string | null
  is_active: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  subscription_status: string
  subscription_plan_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_start_date: string | null
  subscription_end_date: string | null
  created_at: string
  updated_at: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  long_description: string | null
  image_url: string | null
  website_url: string | null
  country: string
  is_active: boolean
  is_featured: boolean
  total_supporters: number
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  value: number
  score_date: string
  created_at: string
}

export interface UserCharitySelection {
  id: string
  user_id: string
  charity_id: string
  contribution_percentage: number
  selected_at: string
  charity?: Charity
}

export interface Draw {
  id: string
  draw_date: string
  numbers: number[]
  draw_type: string
  status: string
  total_pool_amount: number
  jackpot_amount: number
  five_match_pool: number
  four_match_pool: number
  three_match_pool: number
  created_at: string
  published_at: string | null
  created_by: string | null
}

export interface DrawResult {
  id: string
  draw_id: string
  user_id: string
  user_numbers: number[]
  matched_count: number
  matched_numbers: number[]
  prize_tier: string | null
  prize_amount: number
  verification_status: string
  created_at: string
  draw?: Draw
}

export interface WinnerVerification {
  id: string
  draw_result_id: string
  user_id: string
  proof_image_url: string | null
  submission_date: string
  admin_notes: string | null
  verified_by: string | null
  verified_at: string | null
  status: string
  payment_status: string
  paid_at: string | null
}

export interface PrizePoolHistory {
  id: string
  draw_id: string | null
  month_year: string
  total_subscribers: number
  total_pool_amount: number
  jackpot_rollover: number
  five_match_allocated: number
  four_match_allocated: number
  three_match_allocated: number
  five_match_winners: number
  four_match_winners: number
  three_match_winners: number
  created_at: string
}
