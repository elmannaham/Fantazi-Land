# Task 10: Create DatePicker & BookingForm Components

**Context:** Tasks 8-9 (profile detail) complete. Ready to build booking form.

**Scope:** Create BookingForm with date picker, duration selector, price calculation, and Supabase + Base44 submission.

**Files to Create:**
- `app/booking/[profileId]/_components/BookingForm.tsx`
- `app/booking/[profileId]/_components/BookingForm.test.tsx`
- `app/booking/[profileId]/_components/DatePicker.tsx`

**Files to Modify:** (none)

**Interface Requirements:**
- **Consumes:** `Profile` type from `@shared/lib/types`, `supabase` and `base44` clients from `@shared/lib/supabase` and `@shared/lib/base44`
- **Produces:** `BookingForm` and `DatePicker` components
  - BookingForm props: `profile: Profile, onSubmit?: (booking: any) => void`
  - DatePicker props: `value: string, onChange: (date: string) => void, label: string, minDate?: string`

**Testing (TDD):**
1. Write failing tests:
   - BookingForm renders all form fields
   - BookingForm calculates price based on duration
   - BookingForm submits to Supabase + Base44
2. Implement components
3. Run tests — should pass

**Form Fields (from plan):**
- Client name (required)
- Client email (required)
- Project title (required)
- Project description (optional)
- Start date (required, min = today)
- Duration in days (dropdown: 1, 2, 3, 5, 7, 14, 30)
- Budget display (read-only, calculated = rate × duration)
- Submit button (disabled if required fields missing)

**Implementation Details:**
1. DatePicker: native HTML `<input type="date">`
2. Price calc: `profile.base_rate * formData.duration`
3. On submit:
   - Insert to Supabase `bookings` table
   - Sync to Base44 CRM via `base44.createBooking()`
   - Handle errors gracefully
   - Redirect to `/bookings/[bookingId]`

**Success Criteria:**
- Tests pass
- All form fields render
- Price calculation works
- Date picker validates (no past dates)
- Submission creates Supabase booking
- Booking synced to Base44
- Error handling displays user-friendly messages
- No TypeScript errors
- Build passes

**Commits expected:** 1 (BookingForm with DatePicker and tests)
