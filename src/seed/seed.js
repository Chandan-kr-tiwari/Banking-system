require("dotenv").config();

const mongoose = require("mongoose");

const userModel = require("../models/user.model");
const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");

const MONGO_DB_URI = process.env.MONGO_DB_URI;

const DEMO_PASSWORD = "Demo@12345";

async function createTransaction({
    fromAccount,
    toAccount,
    amount,
    idempotencyKey
}) {
    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "COMPLETED"
    });

    await ledgerModel.create([
        {
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        },
        {
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }
    ]);

    return transaction;
}

async function seed() {
    try {
        if (!MONGO_DB_URI) {
            throw new Error("MONGO_DB_URI is not defined in .env");
        }

        await mongoose.connect(MONGO_DB_URI);

        console.log("Connected to MongoDB");

        // --------------------------------------------------
        // Check whether demo data already exists
        // --------------------------------------------------

        const existingDemoUser = await userModel.findOne({
            email: "demo1@example.com"
        });

        if (existingDemoUser) {
            console.log("Demo data already exists.");
            console.log("Seed skipped to protect existing ledger data.");

            return;
        }

        // --------------------------------------------------
        // 1. Create users
        // --------------------------------------------------

        const systemUser = await userModel.create({
            name: "Banking System",
            email: "system@banking-demo.com",
            password: DEMO_PASSWORD,
            systemUser: true
        });

        const demoUser = await userModel.create({
            name: "Demo User",
            email: "demo1@example.com",
            password: DEMO_PASSWORD,
            systemUser: false
        });

        const testUser = await userModel.create({
            name: "Test User",
            email: "demo2@example.com",
            password: DEMO_PASSWORD,
            systemUser: false
        });

        console.log("Users created");

        // --------------------------------------------------
        // 2. Create accounts
        // --------------------------------------------------

        const systemAccount = await accountModel.create({
            user: systemUser._id,
            status: "ACTIVE",
            currency: "INR"
        });

        const demoAccount = await accountModel.create({
            user: demoUser._id,
            status: "ACTIVE",
            currency: "INR"
        });

        const testAccount = await accountModel.create({
            user: testUser._id,
            status: "ACTIVE",
            currency: "INR"
        });

        console.log("Accounts created");

        // --------------------------------------------------
        // 3. Initial funds for Demo User
        // --------------------------------------------------

        await createTransaction({
            fromAccount: systemAccount._id,
            toAccount: demoAccount._id,
            amount: 10000,
            idempotencyKey: "seed-initial-demo-10000"
        });

        // --------------------------------------------------
        // 4. Initial funds for Test User
        // --------------------------------------------------

        await createTransaction({
            fromAccount: systemAccount._id,
            toAccount: testAccount._id,
            amount: 5000,
            idempotencyKey: "seed-initial-test-5000"
        });

        // --------------------------------------------------
        // 5. Demo User → Test User
        // --------------------------------------------------

        await createTransaction({
            fromAccount: demoAccount._id,
            toAccount: testAccount._id,
            amount: 1000,
            idempotencyKey: "seed-demo-to-test-1000"
        });

        console.log("Transactions and ledger entries created");

        // --------------------------------------------------
        // 6. Calculate balances
        // --------------------------------------------------

        const demoBalance = await demoAccount.getBalance();
        const testBalance = await testAccount.getBalance();
        const systemBalance = await systemAccount.getBalance();

        console.log("\n=================================");
        console.log("       SEED COMPLETED");
        console.log("=================================\n");

        console.log("Demo User");
        console.log("Email: demo1@example.com");
        console.log("Password: Demo@12345");
        console.log(`Balance: ₹${demoBalance}`);

        console.log("\nTest User");
        console.log("Email: demo2@example.com");
        console.log("Password: Demo@12345");
        console.log(`Balance: ₹${testBalance}`);

        console.log("\nSystem Account");
        console.log(`Balance: ₹${systemBalance}`);

        console.log("\n=================================\n");

    } catch (error) {
        console.error("\nSeed failed:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
}

seed();