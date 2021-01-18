// Get the modal
var popUp = document.getElementById("popUp");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var images = document.getElementsByClassName("rounded");
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
var imgText = document.getElementById("imgText");
let artistName = document.getElementById("artistName")
let imgUser = document.getElementById("imgUser")
let imgDocId = document.getElementById("imgdocId")
let imgTitle = document.getElementById("imgTitle")
for (let i = 0; i < images.length; i++) {
    var img = images[i];
    img.onclick = function() {
        popUp.style.display = 'block';
        modalImg.src = this.src;
        captionText.innerHTML = this.title;
        imgText.innerHTML = this.alt
        artistName.innerHTML = "Kunstner: " + this.getAttribute("data-user");
        imgUser.value = this.getAttribute("data-user");
        imgDocId.value = this.getAttribute("data-docId");
        console.log(this);
    }
}

// Get the <span> element that closes the modal
var span = document.getElementById("close");
console.log(span)

// When the user clicks on <span> (x), close the modal
span.addEventListener('click', (event) => {
    console.log('klikker')
    popUp.style.display = "none";
});


window.onclick = function(event) {
    if (event.target == popUp) {
        this.popUp.style.display = "none";
    }
}