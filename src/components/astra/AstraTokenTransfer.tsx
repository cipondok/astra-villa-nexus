import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, AlertCircle, DollarSign, ShieldCheck } from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { useAstraToken } from '@/hooks/useAstraToken';
import { useAuth } from '@/contexts/AuthContext';

interface AstraTokenTransferProps {
  className?: string;
}

const AstraTokenTransfer: React.FC<AstraTokenTransferProps> = ({ className }) => {
  const { balance, transferTokens, formatTokenAmount } = useAstraToken();
  const { profile } = useAuth();
  const { showError } = useAlert();
  
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Check verification status
  const isVerified = profile?.verification_status === 'verified';
  
  // Check if user is eligible for transfers (verified + minimum 1000 tokens)
  const hasMinimumTokens = balance && balance.available_tokens >= 1000;
  const isEligible = isVerified && hasMinimumTokens;
  const availableTokens = balance?.available_tokens || 0;

  const handleTransfer = async () => {
    if (!recipientId.trim()) {
      showError('Error', 'Please enter recipient ID');
      return;
    }

    const transferAmount = parseInt(amount);
    if (!transferAmount || transferAmount <= 0) {
      showError('Error', 'Please enter a valid amount');
      return;
    }

    if (transferAmount > availableTokens) {
      showError('Error', 'Insufficient balance');
      return;
    }

    if (!isEligible) {
      showError('Error', 'You need at least 1,000 ASTRA tokens to make transfers');
      return;
    }

    setIsTransferring(true);
    try {
      const result = await transferTokens(recipientId, transferAmount, message);
      if (result) {
        setRecipientId('');
        setAmount('');
        setMessage('');
      }
    } finally {
      setIsTransferring(false);
    }
  };

  const calculateFee = (transferAmount: number) => {
    return Math.max(1, Math.floor(transferAmount * 0.01));
  };

  const transferAmount = parseInt(amount) || 0;
  const transferFee = transferAmount > 0 ? calculateFee(transferAmount) : 0;
  const netAmount = transferAmount - transferFee;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Transfer ASTRA Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isVerified && (
          <div className="bg-chart-3/10 border border-chart-3/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-chart-3">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium">Verification Required</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              You need to verify your account to transfer tokens. 
              Go to your profile settings to start verification.
            </p>
          </div>
        )}

        {isVerified && !hasMinimumTokens && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Minimum Balance Required</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              You need at least 1,000 ASTRA tokens to make transfers. 
              Current balance: {formatTokenAmount(availableTokens)} tokens
            </p>
          </div>
        )}

        {isEligible && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium">Transfers Enabled</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your account is verified and you can transfer tokens to other users.
            </p>
          </div>
        )}

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="recipientId">Recipient User ID</Label>
            <Input
              id="recipientId"
              type="text"
              placeholder="Enter recipient's user ID"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              disabled={!isEligible || isTransferring}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ASTRA)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to transfer"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isEligible || isTransferring}
              min="1"
              max={availableTokens}
            />
            <p className="text-xs text-muted-foreground">
              Available: {formatTokenAmount(availableTokens)} ASTRA
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message for the recipient"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isEligible || isTransferring}
              rows={3}
            />
          </div>

          {transferAmount > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Transfer Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Transfer Amount:</span>
                <span className="text-right">{formatTokenAmount(transferAmount)} ASTRA</span>
                
                <span>Transfer Fee (1%):</span>
                <span className="text-right text-warning">-{formatTokenAmount(transferFee)} ASTRA</span>
                
                <span className="font-medium">Recipient Receives:</span>
                <span className="text-right font-medium text-primary">
                  {formatTokenAmount(netAmount)} ASTRA
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handleTransfer}
            disabled={!isEligible || isTransferring || !recipientId || !amount}
            className="w-full"
          >
            {isTransferring ? (
              'Processing Transfer...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Transfer Tokens
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Account verification required for transfers</p>
          <p>• Minimum 1,000 ASTRA tokens required to make transfers</p>
          <p>• Transfer fee: 1% of transfer amount (minimum 1 token)</p>
          <p>• Transfers are processed immediately and cannot be reversed</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AstraTokenTransfer;