function readURL(input, previewId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function (e) {
            var img = document.createElement('img');
            img.src = e.target.result;
            img.style.display = 'block'; // Make sure the image is visible

            var preview = document.getElementById(previewId);
            preview.innerHTML = ''; // Clear any existing content
            preview.appendChild(img); // Add the new image
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

document.getElementById('uploadUserButton').addEventListener('click', function() {
    document.getElementById('userFileInput').click();
});

document.getElementById('userFileInput').addEventListener('change', function() {
    readURL(this, 'userImagePreview');
});

document.getElementById('uploadReferenceButton').addEventListener('click', function() {
    document.getElementById('referenceFileInput').click();
});

document.getElementById('referenceFileInput').addEventListener('change', function() {
    readURL(this, 'referenceImagePreview');
});
