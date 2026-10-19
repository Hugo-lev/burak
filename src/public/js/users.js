const { response } = require("express");

console.log("Users frontend javascript file");

/*documentrary function.
Agar memberstatusda ozgarish sodir bolganda shu function ishga tushsin.
sycrons = then,catch
*/
$(function () {
  //bu yerda eventimizni ichidan krib kelayotgan  idimizni target qvolyabmiz va id ga tenglayabmiz
  $("member-status").on("change", function (e) {
    const id = e.target.id;
    console.log("id:", id);
    const memberStatus = $(`#$(id).member-status`);
    console.log("memberstatus:", memberStatus);
    //axiosni post methodiga url bn id ni argument qilib path qlyapmz
    axios
      .post("/admin/user/edit", { _id: id, memberStatus: memberStatus })
      /* Response = axiosimizdan kelayotgan umumiy data 
      ichida: configration, data,headers, request member satatus bor*/
      .then((response) => {
        console.log("response:", response);
        /* backendimizdan restorant.cantroller obektidan kelayotgan  kelayotgan data yani login userning malumotlari */
        const result = response.data;
        console.log("result:", data);
        if (result.data) {
          console.log("User updated");
          // blur buyerda statusni ozgartrganmzdan kegn fokusni olib member statusini korsatmedi
          $(".member-status").blur();
        } else alert("User update failed!");
      })
      .catch((err) => {
        console.log(err);
        alert("USER update failed!");
      });
  });
});
