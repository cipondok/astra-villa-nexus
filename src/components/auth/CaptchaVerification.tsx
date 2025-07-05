import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Shield } from 'lucide-react';

interface CaptchaVerificationProps {
  onVerify: (token: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CaptchaVerification = ({ onVerify, onCancel, isLoading }: CaptchaVerificationProps) => {
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let question = '';
    let answer = 0;
    
    switch (operation) {
      case '+':
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        question = `${larger} - ${smaller}`;
        answer = larger - smaller;
        break;
      case '*':
        const smallNum1 = Math.floor(Math.random() * 5) + 1;
        const smallNum2 = Math.floor(Math.random() * 5) + 1;
        question = `${smallNum1} × ${smallNum2}`;
        answer = smallNum1 * smallNum2;
        break;
    }
    
    setCaptchaQuestion(question);
    setCorrectAnswer(answer);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    const userAnswer = parseInt(captchaAnswer);
    if (userAnswer === correctAnswer) {
      // Generate a simple token for verification
      const token = btoa(`${Date.now()}-${Math.random()}`);
      onVerify(token);
    } else {
      setCaptchaAnswer('');
      generateCaptcha();
      // Could show error message here
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-lg">Security Verification</CardTitle>
          <p className="text-sm text-muted-foreground">
            Multiple failed attempts detected. Please solve this math problem to continue.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-mono font-bold mb-2">
              {captchaQuestion} = ?
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateCaptcha}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              New Problem
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="captcha-answer">Your Answer</Label>
            <Input
              id="captcha-answer"
              type="number"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter the answer"
              className="text-center text-lg"
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isLoading || !captchaAnswer}
              className="flex-1"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptchaVerification;