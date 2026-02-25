
-- Trigger: notify on new rental message
CREATE OR REPLACE FUNCTION public.notify_rental_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _booking rental_bookings%ROWTYPE;
  _property properties%ROWTYPE;
  _sender_name TEXT;
  _recipient_id UUID;
BEGIN
  SELECT * INTO _booking FROM rental_bookings WHERE id = NEW.booking_id;
  SELECT * INTO _property FROM properties WHERE id = _booking.property_id;
  SELECT full_name INTO _sender_name FROM profiles WHERE id = NEW.sender_id;

  -- Notify all participants except sender
  FOR _recipient_id IN
    SELECT DISTINCT uid FROM (
      SELECT _booking.customer_id AS uid
      UNION SELECT _booking.agent_id AS uid
      UNION SELECT _property.owner_id AS uid
    ) participants WHERE uid IS NOT NULL AND uid != NEW.sender_id
  LOOP
    INSERT INTO admin_alerts (title, message, type, priority, alert_category, reference_type, reference_id, source_id, source_table)
    VALUES (
      'Pesan Baru - ' || _property.title,
      COALESCE(_sender_name, 'Seseorang') || ': ' || LEFT(NEW.message, 100),
      'rental',
      'medium',
      'rental',
      'rental_booking',
      NEW.booking_id::text,
      _recipient_id::text,
      'rental_messages'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_rental_message
  AFTER INSERT ON public.rental_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_rental_message();

-- Trigger: notify on document upload
CREATE OR REPLACE FUNCTION public.notify_rental_document()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _booking rental_bookings%ROWTYPE;
  _property properties%ROWTYPE;
  _uploader_name TEXT;
  _recipient_id UUID;
  _doc_label TEXT;
BEGIN
  SELECT * INTO _booking FROM rental_bookings WHERE id = NEW.booking_id;
  SELECT * INTO _property FROM properties WHERE id = _booking.property_id;
  SELECT full_name INTO _uploader_name FROM profiles WHERE id = NEW.uploaded_by;

  _doc_label := CASE NEW.document_type
    WHEN 'contract' THEN 'Kontrak Sewa'
    WHEN 'id_card' THEN 'KTP/ID'
    WHEN 'payment_proof' THEN 'Bukti Pembayaran'
    WHEN 'inspection' THEN 'Laporan Inspeksi'
    ELSE 'Dokumen'
  END;

  FOR _recipient_id IN
    SELECT DISTINCT uid FROM (
      SELECT _booking.customer_id AS uid
      UNION SELECT _booking.agent_id AS uid
      UNION SELECT _property.owner_id AS uid
    ) participants WHERE uid IS NOT NULL AND uid != NEW.uploaded_by
  LOOP
    INSERT INTO admin_alerts (title, message, type, priority, alert_category, reference_type, reference_id, source_id, source_table, action_required)
    VALUES (
      _doc_label || ' Baru - ' || _property.title,
      COALESCE(_uploader_name, 'Seseorang') || ' mengunggah ' || NEW.file_name,
      'rental',
      CASE WHEN NEW.requires_signature THEN 'high' ELSE 'medium' END,
      'rental',
      'rental_booking',
      NEW.booking_id::text,
      _recipient_id::text,
      'rental_documents',
      NEW.requires_signature
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_rental_document
  AFTER INSERT ON public.rental_documents
  FOR EACH ROW EXECUTE FUNCTION public.notify_rental_document();

-- Trigger: notify on document signing
CREATE OR REPLACE FUNCTION public.notify_rental_document_signed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _booking rental_bookings%ROWTYPE;
  _property properties%ROWTYPE;
  _signer_name TEXT;
BEGIN
  -- Only fire when signed_at changes from null to not null
  IF OLD.signed_at IS NOT NULL OR NEW.signed_at IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO _booking FROM rental_bookings WHERE id = NEW.booking_id;
  SELECT * INTO _property FROM properties WHERE id = _booking.property_id;
  SELECT full_name INTO _signer_name FROM profiles WHERE id = NEW.signed_by;

  -- Notify the uploader
  INSERT INTO admin_alerts (title, message, type, priority, alert_category, reference_type, reference_id, source_id, source_table)
  VALUES (
    'Dokumen Ditandatangani - ' || _property.title,
    COALESCE(_signer_name, 'Seseorang') || ' menandatangani ' || NEW.file_name,
    'rental',
    'high',
    'rental',
    'rental_booking',
    NEW.booking_id::text,
    NEW.uploaded_by::text,
    'rental_documents'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_rental_document_signed
  AFTER UPDATE ON public.rental_documents
  FOR EACH ROW EXECUTE FUNCTION public.notify_rental_document_signed();
