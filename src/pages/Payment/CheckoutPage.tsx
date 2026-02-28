import { useParams, useNavigate } from "react-router-dom";
import { useGetCourseByIdQuery } from "@/redux/features/course/courseApi";
import { useGetMeQuery } from "@/redux/features/auth/authApi";
import { useCreateCheckoutSessionMutation } from "@/redux/features/payment/payment.api";
import { toast } from "sonner";
import { CreditCard, Loader2, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IEnrolledCourse } from "@/types";
import { Logger, debugOnly } from "@/utils/logger";

const CheckoutPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: courseData, isLoading: isCourseLoading } = useGetCourseByIdQuery(
    courseId!,
    { skip: !courseId }
  );
  const { data: userData } = useGetMeQuery(undefined);
  const [createCheckoutSession, { isLoading: isCheckoutLoading }] =
    useCreateCheckoutSessionMutation();

  const course = courseData?.data;
  const isEnrolled = userData?.data?.enrolledCourses?.some(
    (enrolledCourse: IEnrolledCourse) => enrolledCourse.courseId === courseId
  );

  const handleCheckout = async () => {
    if (!courseId || !course) {
      toast.error("Invalid course data");
      return;
    }

    if (!userData?.data?._id) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (isEnrolled) {
      toast.error("You are already enrolled in this course");
      navigate(`/courses/${courseId}`);
      return;
    }

    try {
      const amount = course.coursePrice || 0;
      debugOnly.log("Creating checkout session:", { courseId, amount });

      const response = await createCheckoutSession({
        courseId,
        amount,
      }).unwrap();

      const checkoutUrl = response?.data?.url;

      if (!checkoutUrl) {
        Logger.error("Invalid response from server", { response });
        toast.error("Failed to get checkout URL from server");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      Logger.error("Checkout error", { error });
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error
            ? String((error as { message: string }).message)
            : "Payment failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (!courseId) {
    navigate("/courses");
    return null;
  }

  if (isCourseLoading) {
    return (
      <div className="container mx-auto py-12 mt-20 max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-12 mt-20 text-center">
        <p className="text-lg text-gray-600">Course not found</p>
        <Button variant="outline" onClick={() => navigate("/courses")} className="mt-4">
          Browse Courses
        </Button>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className="container mx-auto py-12 mt-20 text-center">
        <p className="text-lg text-gray-600">You are already enrolled in this course.</p>
        <Button
          onClick={() => navigate("/student/dashboard")}
          className="mt-4"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 mt-20 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <img
              src={course.courseThumbnail}
              alt={course.title}
              className="w-full sm:w-48 h-36 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
              {course.description && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {course.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                <BookOpen className="h-5 w-5" />
                ${(course.coursePrice || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckoutLoading}
            >
              {isCheckoutLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 text-center mt-4">
              You will be redirected to Stripe to complete your purchase securely.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutPage;
