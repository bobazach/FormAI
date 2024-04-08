document.getElementById('imageInput1').addEventListener('change', function() {
    loadImage(this, 'image1', 'uploadBlock1');
});
  
document.getElementById('imageInput2').addEventListener('change', function() {
    loadImage(this, 'image2', 'uploadBlock2');
});

function loadImage(input, imgId, uploadBlockId) {
    const img = document.getElementById(imgId);
    const uploadBlock = document.getElementById(uploadBlockId);
    const imageContainer = uploadBlock.querySelector('.image-container');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            img.src = e.target.result;
            img.style.display = 'block';
            imageContainer.style.display = 'block';
            // Hide box
            const uploadInstructions = uploadBlock.querySelector('p');
            if (uploadInstructions) {
                uploadInstructions.style.display = 'none';
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}
