console.log("Signup frontend javascript file");

$(function () {
  
  const fileTarget = $(".file-box .upload-hidden");

  let filename;
  fileTarget.on("change", function () {
    if (window.FileReader) {
      // files[0] → foydalanuvchi tanlagan birinchi fayl
      const uploadFile = $(this)[0].files[0];

      // Obyekt xossasiga NUQTA bilan murojaat qilinadi: uploadFile.type
      const fileType = uploadFile.type;
      const validImageType = ["image/jpg", "image/jpeg", "image/png"];

      if (!validImageType.includes(fileType)) {
        alert("please insert only jpeg, jpg, and png images");
      } else {
        // createObjectURL → tanlangan faylning vaqtinchalik manzili (preview uchun)
        $(".upload-img-frame")
          .attr("src", URL.createObjectURL(uploadFile))
          .addClass("success");
        // Inputda fayl NOMI (matn) ko'rinadi, obyektning o'zi emas
        $(this).siblings(".upload-name").val(uploadFile.name);
      }
    }
  });
});

function validateSignupForm() {
  const memberNick = $(".member-nick").val();
  const memberPhone = $(".member-phone").val();
  const memberPassword = $(".member-password").val();
  const confirmPassword = $(".confirm-password").val();
  if (
    memberNick === "" ||
    memberPhone === "" ||
    memberPassword === "" ||
    confirmPassword === ""
  ) {
    alert("Please insert all required inputs");
    return false;
  }

  if (memberPassword !== confirmPassword) {
    alert("Password differs,please check");
    return false;
  }
  const memberImage = $(".member-image").get(0).files[0]
    ? $(".member-image").get(0).files[0].name
    : null;
  if (!memberImage) {
    alert("Please insert Restourant image!");
    return false;
  }
}
