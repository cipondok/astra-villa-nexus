-- Disable failing AFTER INSERT email trigger on public.inquiries to stop calling missing extensions.http_post
ALTER TABLE public.inquiries DISABLE TRIGGER trigger_inquiry_email;