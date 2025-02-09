document.addEventListener("DOMContentLoaded", () => {
   

    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        
        console.log(`Username: ${username}, Password: ${password}`);
    });

    
});
