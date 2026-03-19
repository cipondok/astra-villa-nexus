/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'

interface NewReviewProps {
  owner_name: string
  reviewer_name: string
  rating: string
  property_title: string
  review_text: string
}

export const NewReviewEmail = ({
  owner_name, reviewer_name, rating, property_title, review_text,
}: NewReviewProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New {rating}★ review on {property_title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Review Received</Heading>
        <Text style={text}>Hi {owner_name},</Text>
        <Text style={text}>
          <strong>{reviewer_name}</strong> left a <strong>{rating}★</strong> review on <strong>{property_title}</strong>:
        </Text>
        <Container style={quoteBox}>
          <Text style={quoteText}>"{review_text}"</Text>
        </Container>
        <Text style={text}>
          Visit your dashboard to respond to this review.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Astra Villa Realty — Your gateway to premium Indonesian property.</Text>
      </Container>
    </Body>
  </Html>
)

export default NewReviewEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0d1f2d', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#5c6e7f', lineHeight: '1.6', margin: '0 0 16px' }
const quoteBox = { backgroundColor: '#f0f9ff', borderLeft: '3px solid #00A3F5', borderRadius: '0 10px 10px 0', padding: '16px 20px', margin: '0 0 20px' }
const quoteText = { fontSize: '14px', color: '#0d1f2d', lineHeight: '1.6', margin: '0', fontStyle: 'italic' as const }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
