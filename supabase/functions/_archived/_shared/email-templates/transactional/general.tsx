/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { main, wrapper, header, logoText, content, h1, text, footerWrap, footer, brand } from './_styles.ts'

interface Props {
  subject?: string
  message: string
}

export const GeneralEmail = ({ subject, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject || `Message from ${brand.siteName}`}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Container style={header}>
          <Text style={logoText}>{brand.siteName}</Text>
        </Container>
        <Container style={content}>
          {subject && <Heading style={h1}>{subject}</Heading>}
          <Text style={text}>{message}</Text>
        </Container>
        <Hr style={{ borderColor: '#e5e7eb', margin: '0' }} />
        <Container style={footerWrap}>
          <Text style={footer}>{brand.siteName} — {brand.tagline}</Text>
        </Container>
      </Container>
    </Body>
  </Html>
)

export default GeneralEmail
