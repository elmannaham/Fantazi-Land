"use client";

import { Card, CardBody } from "@/components/atoms/Card";
import { Rating } from "@/components/atoms/Rating";
import { Avatar } from "@/components/atoms/Avatar";

interface Review {
  id: string | number;
  client: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

interface ReviewsListProps {
  reviews: Review[];
  isLoading?: boolean;
}

export function ReviewsList({ reviews, isLoading = false }: ReviewsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 bg-slate-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-slate-600">Aucun avis pour le moment</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardBody>
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <Avatar
                  name={review.client}
                  alt={review.client}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {review.client}
                    </h3>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        ✓ Vérifié
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{review.date}</p>
                </div>
              </div>
            </div>

            <div className="mb-2">
              <Rating score={review.rating} />
            </div>

            <p className="text-slate-700 text-sm leading-relaxed">
              {review.comment}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
