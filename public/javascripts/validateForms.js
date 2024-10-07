// Adds client-side form validation to all forms with class 'validated-form'. 
// Prevents submission if invalid, and adds Bootstrap's 'was-validated' class for validation styling.
(function () {
    'use strict';

    window.addEventListener('load', function () {
        const forms = document.getElementsByClassName('validated-form');
        const validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

})()