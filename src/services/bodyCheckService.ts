import { BodyCheckRecord, AuditEvent } from '../types/bodyCheck';
import { INITIAL_BODY_CHECKS } from '../data/mockRecords';

const STORAGE_KEY = 'bodycheck_records_v10';

class BodyCheckService {
  private records: BodyCheckRecord[] = [];

  constructor() {
    this.loadRecords();
  }

  private loadRecords(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.records = JSON.parse(saved);
        return;
      }
    } catch (e) {
      console.warn('Failed to load body checks from storage:', e);
    }
    this.records = [...INITIAL_BODY_CHECKS];
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch (e) {
      console.warn('Failed to persist body checks:', e);
    }
  }

  public getRecords(): BodyCheckRecord[] {
    return [...this.records];
  }

  public getRecordById(id: string): BodyCheckRecord | undefined {
    return this.records.find(r => r.id === id);
  }

  public generateCheckId(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `BC-${new Date().getFullYear()}-${num}`;
  }

  public getCurrentTimestamp(): string {
    return this.formatTimestamp();
  }

  public saveNewCheck(record: BodyCheckRecord): BodyCheckRecord {
    // Ensure record has updatedAt
    if (!record.updatedAt) {
      record.updatedAt = this.formatTimestamp();
    }
    // Check if record already exists
    const existingIndex = this.records.findIndex(r => r.id === record.id);
    if (existingIndex >= 0) {
      this.records[existingIndex] = record;
    } else {
      this.records = [record, ...this.records];
    }
    this.saveToStorage();
    return record;
  }

  public saveDraftObservation(
    recordId: string,
    draftText: string,
    reviewerName: string = 'Sarah Mitchell'
  ): BodyCheckRecord | undefined {
    const record = this.records.find(r => r.id === recordId);
    if (!record) return undefined;

    const timestamp = this.formatTimestamp();
    record.finalObservation = draftText;
    record.draftSavedAt = timestamp;
    record.updatedAt = timestamp;
    record.status = 'ai_draft_ready';

    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      actor: reviewerName,
      actorRole: 'Reviewer',
      action: 'Saved observation draft',
      details: 'Reviewer updated draft observation text.'
    };

    record.auditTrail = [auditEvent, ...record.auditTrail];
    this.saveToStorage();
    return record;
  }

  public confirmObservation(
    recordId: string,
    finalText: string,
    reviewerName: string = 'Sarah Mitchell',
    reviewerRole: string = 'Reviewer',
    notes?: string
  ): BodyCheckRecord | undefined {
    const record = this.records.find(r => r.id === recordId);
    if (!record) return undefined;

    const timestamp = this.formatTimestamp();
    record.finalObservation = finalText;
    record.status = 'confirmed';
    record.reviewer = reviewerName;
    record.reviewerRole = reviewerRole;
    record.confirmedAt = timestamp;
    record.updatedAt = timestamp;
    if (notes) record.reviewerNotes = notes;

    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      actor: reviewerName,
      actorRole: reviewerRole,
      action: 'Observation confirmed',
      details: notes ? `Confirmed with note: "${notes}"` : 'Observation confirmed and logged to history.'
    };

    record.auditTrail = [auditEvent, ...record.auditTrail];
    this.saveToStorage();
    return record;
  }

  public resetToDemoData(): BodyCheckRecord[] {
    this.records = [...INITIAL_BODY_CHECKS];
    this.saveToStorage();
    return [...this.records];
  }

  private formatTimestamp(): string {
    return new Date().toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace('T', ' ');
  }
}

export const bodyCheckService = new BodyCheckService();
