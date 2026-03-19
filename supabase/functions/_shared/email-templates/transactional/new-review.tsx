/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { main, wrapper, header, logoText, content, h1, text, quoteBox, quoteText, footerWrap, footer, brand } from './_styles.ts'

interface Props {
  owner_name: string
  reviewer_name: string
  rating: string
  property_title: string
  review_text: string
}

export const NewReviewEmail = ({ owner_name, reviewer_name, rating, property_title, review_text }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New {rating}★ review on {property_title}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Container style={header}>
          <Text style={logoText}>{brand.siteName}</Text>
        </Container>
        <Container style={content}>
          <Heading style={h1}>New Review Received</Heading>
          <Text style={text}>Hi {owner_name},</Text>
          <Text style={text}><strong>{reviewer_name}</strong> left a <strong>{rating}★</strong> review on <strong>{property_title}</strong>:</Text>
          <Container style={quoteBox}>
            <Text style={quoteText}>"{review_text}"</Text>
          </Container>
          <Text style={text}>Visit your dashboard to respond to this review.</Text>
        </Container>
        <Hr style={{ borderColor: '#e5e7eb', margin: '0' }} />
        <Container style={footerWrap}>
          <Text style={footer}>{brand.siteName} — {brand.tagline}</Text>
        </Container>
      </Container>
    </Body>
  </Html>
)

export default NewReviewEmail
