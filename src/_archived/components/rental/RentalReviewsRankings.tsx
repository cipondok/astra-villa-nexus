import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, MessageSquare, ThumbsUp, Award } from "lucide-react";

interface ReviewItem {
  id: string;
  tenantName: string;
  propertyTitle: string;
  rating: number;
  comment: string;
  date: string;
}

interface RentalReviewsRankingsProps {
  averageRating: number;
  totalReviews: number;
  ranking: number;
  totalLandlords: number;
  ratingBreakdown: { stars: number; count: number }[];
  recentReviews: ReviewItem[];
  badges: string[];
}

const RentalReviewsRankings = ({
  averageRating, totalReviews, ranking, totalLandlords,
  ratingBreakdown, recentReviews, badges
}: RentalReviewsRankingsProps) => {
  const maxCount = Math.max(...ratingBreakdown.map(r => r.count), 1);

  return (
    <div className="space-y-2">
      {/* Rating + Ranking Overview */}
      <div className="grid grid-cols-2 gap-1.5">
        <Card className="p-2.5 text-center">
          <Star className="h-5 w-5 mx-auto mb-1 text-chart-3 fill-chart-3" />
          <p className="text-lg font-bold text-foreground">{averageRating.toFixed(1)}</p>
          <p className="text-[8px] text-muted-foreground">{totalReviews} ulasan</p>
          {/* Star breakdown */}
          <div className="mt-2 space-y-0.5">
            {ratingBreakdown.map(r => (
              <div key={r.stars} className="flex items-center gap-1">
                <span className="text-[7px] w-2 text-muted-foreground">{r.stars}</span>
                <Progress value={(r.count / maxCount) * 100} className="h-1 flex-1" />
                <span className="text-[7px] w-3 text-right text-muted-foreground">{r.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-2.5 text-center">
          <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold text-foreground">#{ranking}</p>
          <p className="text-[8px] text-muted-foreground">dari {totalLandlords} pemilik</p>
          {/* Badges */}
          <div className="flex flex-wrap gap-0.5 justify-center mt-2">
            {badges.map((badge, i) => (
              <Badge key={i} variant="outline" className="text-[7px] px-1 py-0 h-3.5 gap-0.5">
                <Award className="h-2 w-2" /> {badge}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Reviews */}
      <div className="space-y-1">
        <h4 className="text-[10px] font-semibold text-foreground flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> Ulasan Terbaru
        </h4>
        {recentReviews.length === 0 ? (
          <Card className="p-3 text-center">
            <p className="text-[9px] text-muted-foreground">Belum ada ulasan dari penyewa.</p>
          </Card>
        ) : (
          recentReviews.map(review => (
            <Card key={review.id} className="p-2">
              <div className="flex items-start justify-between gap-1 mb-0.5">
                <div>
                  <p className="text-[9px] font-medium text-foreground">{review.tenantName}</p>
                  <p className="text-[7px] text-muted-foreground">{review.propertyTitle}</p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-2 w-2 ${i < review.rating ? 'text-chart-3 fill-chart-3' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>
              <p className="text-[8px] text-muted-foreground leading-relaxed">{review.comment}</p>
              <p className="text-[7px] text-muted-foreground/60 mt-0.5">
                {new Date(review.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RentalReviewsRankings;
