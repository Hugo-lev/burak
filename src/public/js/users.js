console.log("Users frontend javascript file");
/*
bu funuksiya foydalanuvchi statusini aktiv yoki blok 
qlgandagi statusini websaytni yanglamasdan almashtrb berai */
//Jqury function bolib sahifadegi hamma elementlar yuklanb
//  bolganda kegin ichidagi funuksiyani ishlatb beradi
$(function () {
  // member statusini ozgartrayotganimizda change function ishga tushadi
  $(".member-status").on("change", function (e) {
    // qaysi foydalonovchining statusi ozgarganini aniqlash uchun oshi elementni oladi
    const id = e.target.id,
      //osha elementdan foydalanuvchi tanlagan yangi qiymatni oladi masala- ACTIVE BLOCK
      memberStatus = $(`#${id}.member-status`).val();
    console.log("memberStatus:", memberStatus);

    // TODO: Axios updateChosenUser AXios orqali serverga sorov yuboramiz
    //olingan malumotlarni id va yangi memberstatus
    // severdagi shu url manziliga post methodi orqali yuboradi
    axios
      .post("/admin/user/edit", {
        _id: id,
        memberStatus: memberStatus,
      })
      // serverdan javob kelgach response data orqali malumot olinadi agar mufaqiyatlik amalga oshsa oshi elementdan fokus olinadi
      .then((response) => {
        console.log("response:", response);
        const result = response.data;

        if (result.data) {
          $(".member-status").blur();
        } else alert("User update failed!");
      })
      .catch((err) => {
        console.log(err);
        alert("User update failed!");
      });
  });
});
