/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { envVars } from './app/config/env';
import { seedSuperAdmin } from './app/utils/seedSuperAdmin';

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);

        console.log('Connected to database');

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on port ${envVars.PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
    }
};

(async() => {
   await startServer();
   await seedSuperAdmin();
})();

// unhandled Rejection error
process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection detected... Server shutting down gracefully', err);

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

//  Sigterm signal termination
process.on('SIGTERM', () => {
    console.log('SIGTERM signal receieved... Server shutting down gracefully');

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

//  Sigint signal termination
process.on('SIGINT', () => {
    console.log('SIGINT signal receieved... Server shutting down');

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

//  Uncaught exceptions
process.on('uncaughtException', err => {
    console.log('uncaught exceptions detected... Server shutting down gracefully', err);

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

// Unhandled rejection error
// Promise.reject(new Error("I forgot to catch this promise"))

// Uncaught Exception error
// throw new Error("I forgot to handle this local error")

/**
 * unhandled rejection error
 * uncaught rejection error
 * signal termination sigterm
 */
