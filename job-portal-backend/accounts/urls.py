from django.urls import path
from .views import (
    RegisterEmployerView,
    RegisterSeekerView,
    EmployerDetailView,
    SeekerDetailView,
    UploadResume,
    ChangePasswordView,
    SendOTPView,
    VerifyOTPView,
    ForgotPasswordRequest,
    ForgotPasswordReset,
    ChangeEmailView,
    UploadSeekerProfilePic,
    request_password_reset_otp, verify_password_reset_otp
)

urlpatterns = [
    path("register/employer/", RegisterEmployerView.as_view()),
    path("register/seeker/", RegisterSeekerView.as_view()),
    path("profile/employer/", EmployerDetailView.as_view()),
    path("profile/seeker/", SeekerDetailView.as_view()),

    path("seeker/upload-resume/", UploadResume.as_view(), name="upload-resume"),
    path("change-password/", ChangePasswordView.as_view()),

    # ✅ OTP
    path("otp/send/", SendOTPView.as_view()),
    path("otp/verify/", VerifyOTPView.as_view()),

    # ✅ Forgot password
    path("password/forgot/", ForgotPasswordRequest.as_view()),
    path("password/reset/", ForgotPasswordReset.as_view()),
    path("email/change/", ChangeEmailView.as_view()),
    path("seeker/upload-profile-pic/", UploadSeekerProfilePic.as_view(), name="upload-profile-pic"),
    path("password-reset/request-otp/", request_password_reset_otp),
    path("password-reset/verify-otp/", verify_password_reset_otp),

]