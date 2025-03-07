// Import necessary dependencies
import { deleteUserAccount } from './delete.js';
import { deleteCookieData } from './delete.js';

// Define routes for handling actions
const routes = {
    '/delete-account': deleteUserAccount,
    '/delete-cookie-data': deleteCookieData,
};

// Function to handle route navigation and execution
export function handleRoute(route) {
    const handler = routes[route];
    if (handler) {
        handler();
    } else {
        console.error(`No handler found for route: ${route}`);
    }
}

// Attach event listeners for route-based actions
document.addEventListener('DOMContentLoaded', () => {
    // Delete Account Button
    const deleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            handleRoute('/delete-account');
        });
    }

    // Delete Cookie Data Button
    const deleteCookieDataBtn = document.getElementById('confirmDeleteCookieDataBtn');
    if (deleteCookieDataBtn) {
        deleteCookieDataBtn.addEventListener('click', () => {
            handleRoute('/delete-cookie-data');
        });
    }
});