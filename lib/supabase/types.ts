export type MemberStatus = "pending" | "active" | "inactive" | "alumni";
export type JciLevel = "member" | "senator" | "alumnus";
export type AdminRole = "president" | "secretaire" | "charge_formation" | "charge_communication";
export type ActivityType = "formation" | "activite" | "reunion" | "initiative" | "autre";
export type ActivityStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type AttendanceSource = "google_form" | "manual" | "site";
export type ProjectStatus = "planned" | "active" | "completed";

export type EngagementLevel = "inactif" | "actif" | "tres_actif" | "champion";

export const ENGAGEMENT_LEVELS: Record<EngagementLevel, { label: string; color: string; min: number; max: number }> = {
  inactif:    { label: "Inactif",    color: "gray",  min: 0,  max: 30  },
  actif:      { label: "Actif",      color: "blue",  min: 31, max: 60  },
  tres_actif: { label: "Très actif", color: "cyan",  min: 61, max: 85  },
  champion:   { label: "Champion",   color: "amber", min: 86, max: 100 },
};

export function getEngagementLevel(score: number): EngagementLevel {
  if (score <= 30) return "inactif";
  if (score <= 60) return "actif";
  if (score <= 85) return "tres_actif";
  return "champion";
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Member = {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profession: string | null;
  bio: string | null;
  avatar_url: string | null;
  status: MemberStatus;
  jci_level: JciLevel;
  community_role: string | null;
  join_date: string | null;
  invited_by: string | null;
  birth_date: string | null;
  commune: string | null;
  education_level: string | null;
  interests: string[] | null;
  how_heard: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberApplication = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  birth_date: string | null;
  commune: string;
  profession: string | null;
  education_level: string | null;
  interests: string[];
  how_heard: string;
  motivation: string;
  status: ApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  member_id: string | null;
  submitted_at: string;
};

export type AdminUser = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
};

export type Activity = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: ActivityType;
  activity_date: string;
  location: string | null;
  registration_link: string | null;
  google_sheet_id: string | null;
  sheet_email_column: string;
  registration_deadline: string | null;
  capacity: number | null;
  status: ActivityStatus;
  cover_image_url: string | null;
  created_by: string | null;
  created_at: string;
};

export type Attendance = {
  id: string;
  activity_id: string;
  member_id: string | null;
  external_email: string | null;
  external_name: string | null;
  registered_at: string | null;
  attended: boolean;
  source: AttendanceSource;
  imported_at: string | null;
  notes: string | null;
};

export type Due = {
  id: string;
  member_id: string;
  year: number;
  amount: number | null;
  paid_at: string | null;
  confirmed_by: string | null;
  notes: string | null;
};

export type MemberRole = {
  id: string;
  member_id: string;
  role_title: string;
  commission: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
};

export type EngagementScore = {
  total: number;
  level: EngagementLevel;
  breakdown: {
    presence: number;      // /40
    formations: number;    // /25
    cotisation: number;    // /20
    role: number;          // /15
  };
};
