import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { upsertJournalEntry, getJournalEntries, deleteJournalEntry } from "../controllers/journalController.js";

const router = Router();
router.use(protect);

router.post("/", upsertJournalEntry);
router.get("/", getJournalEntries);
router.delete("/:id", deleteJournalEntry);

export default router;
