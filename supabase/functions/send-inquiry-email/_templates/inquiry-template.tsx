import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface InquiryEmailProps {
  customer_name: string;
  inquiry_type: string;
  message: string;
  company_name?: string;
}

export const InquiryEmail = ({
  customer_name,
  inquiry_type,
  message,
  company_name = "Our Company",
}: InquiryEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for your inquiry - We'll get back to you soon</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank You for Contacting Us</Heading>
        
        <Text style={text}>
          Dear {customer_name},
        </Text>
        
        <Text style={text}>
          We have received your inquiry regarding <strong>{inquiry_type}</strong> and 
          appreciate you taking the time to reach out to us.
        </Text>

        <Section style={messageBox}>
          <Text style={messageLabel}>Your Message:</Text>
          <Text style={messageContent}>{message}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          Our team will review your inquiry and get back to you as soon as possible, 
          typically within 24-48 hours.
        </Text>

        <Text style={text}>
          In the meantime, if you have any urgent questions, please don't hesitate to 
          contact us directly.
        </Text>

        <Text style={footer}>
          Best regards,
          <br />
          {company_name} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InquiryEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 48px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
}

const messageBox = {
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  margin: '24px 48px',
  padding: '16px',
}

const messageLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const messageContent = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 48px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
  marginTop: '32px',
}
