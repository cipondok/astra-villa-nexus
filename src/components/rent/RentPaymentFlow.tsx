
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Coins, CreditCard } from 'lucide-react';
import { useRentPayment } from '@/hooks/useRentPayment';
import { useTokenBalance } from '@/hooks/useTokenBalance';

interface RentPaymentFlowProps {
  propertyId: string;
  propertyTitle: string;
  dailyRate: string;
  contractAddress: string;
  onClose?: () => void;
}

const RentPaymentFlow: React.FC<RentPaymentFlowProps> = ({
  propertyId,
  propertyTitle,
  dailyRate,
  contractAddress,
  onClose,
}) => {
  const [duration, setDuration] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const { processRentPayment, isProcessing, transactionHash, isSuccess } = useRentPayment();
  const { balance, hasMinimumBalance } = useTokenBalance();

  const calculateDurationInDays = () => {
    switch (durationUnit) {
      case 'weeks':
        return duration * 7;
      case 'months':
        return duration * 30;
      default:
        return duration;
    }
  };

  const calculateTotalCost = () => {
    const days = calculateDurationInDays();
    return (parseFloat(dailyRate) * days).toFixed(2);
  };

  const totalCost = calculateTotalCost();
  const canAfford = hasMinimumBalance(totalCost);

  const handlePayment = async () => {
    await processRentPayment({
      propertyId,
      tokenAmount: totalCost,
      durationDays: calculateDurationInDays(),
      contractAddress,
    });
  };

  if (isSuccess && transactionHash) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Payment Successful!</CardTitle>
          <CardDescription>
            Your rental payment has been processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="border-green-300 text-green-700">
              Transaction Hash: {transactionHash.slice(0, 10)}...
            </Badge>
          </div>
          {onClose && (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Rent Payment
        </CardTitle>
        <CardDescription>
          {propertyTitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Duration Selection */}
        <div className="space-y-2">
          <Label>Rental Duration</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              className="flex-1"
            />
            <Select value={durationUnit} onValueChange={(value: any) => setDurationUnit(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily Rate:</span>
            <span>{dailyRate} ASTRA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Duration:</span>
            <span>{calculateDurationInDays()} days</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total Cost:</span>
            <span className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              {totalCost} ASTRA
            </span>
          </div>
        </div>

        {/* Balance Check */}
        {balance && (
          <div className="flex justify-between items-center text-sm">
            <span>Your Balance:</span>
            <Badge variant={canAfford ? "default" : "destructive"}>
              {parseFloat(balance).toFixed(2)} ASTRA
            </Badge>
          </div>
        )}

        {/* Payment Button */}
        <div className="space-y-2">
          <Button
            onClick={handlePayment}
            disabled={!canAfford || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay {totalCost} ASTRA
              </>
            )}
          </Button>

          {!canAfford && (
            <p className="text-sm text-red-600 text-center">
              Insufficient ASTRA tokens for this rental
            </p>
          )}
        </div>

        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RentPaymentFlow;
