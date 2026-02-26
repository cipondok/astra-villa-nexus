

## Tenant Document Management

### Overview
Build a document management system where tenants upload documents (KTP, contracts, payment proofs) and property owners can review, verify, and track expiry dates.

### Database Changes

**New table: `tenant_documents`**
- `id` (uuid, PK)
- `tenant_id` (uuid, references auth.users, NOT NULL)
- `property_id` (uuid, references properties, nullable)
- `document_type` (text: 'ktp', 'kontrak', 'bukti_bayar', 'kk', 'npwp', 'other')
- `file_url` (text, NOT NULL)
- `file_name` (text)
- `verification_status` (text: 'pending', 'verified', 'rejected', default 'pending')
- `verified_by` (uuid, nullable)
- `verified_at` (timestamptz, nullable)
- `rejection_reason` (text, nullable)
- `expires_at` (date, nullable) — for expiry tracking
- `notes` (text, nullable)
- `created_at` (timestamptz, default now())

**Storage bucket: `tenant-documents`** (private, with RLS policies for tenant upload + owner read)

**RLS policies:**
- Tenants can INSERT/SELECT their own documents
- Property owners can SELECT documents for tenants on their properties
- Property owners can UPDATE verification_status on tenant documents

### New Components

1. **`OwnerTenantDocuments.tsx`** — Owner-facing tab in PropertyOwnerOverview
   - List all tenant documents grouped by tenant/property
   - Filter by status (pending/verified/rejected) and document type
   - Verify/reject actions with reason input
   - Expiry warning badges (documents expiring within 30 days)
   - Click to preview/download document

2. **Tab integration** — Add "Dokumen" tab with `FileText` icon to `PropertyOwnerOverview.tsx`

### Implementation Steps

1. Run migration: create `tenant_documents` table, storage bucket, and RLS policies
2. Create `OwnerTenantDocuments.tsx` with document list, filters, verify/reject dialogs, and expiry tracking
3. Add "Dokumen" tab to `PropertyOwnerOverview.tsx`

