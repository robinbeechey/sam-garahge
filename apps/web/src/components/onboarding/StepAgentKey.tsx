import type { AgentType, SaveAgentCredentialRequest } from '@simple-agent-manager/shared';
import { AGENT_CATALOG } from '@simple-agent-manager/shared';
import { Alert, Button, Input } from '@simple-agent-manager/ui';
import { useRef, useState } from 'react';

import { saveAgentCredential, validateAgentCredential } from '../../lib/api';

interface StepAgentKeyProps {
  onComplete: () => void;
  onSkip: () => void;
  isComplete: boolean;
}

function getValidateButtonLabel(validating: boolean, isValidated: boolean): string {
  if (validating) return 'Testing...';
  if (isValidated) return 'Tested';
  return 'Test key';
}

export function StepAgentKey({ onComplete, onSkip, isComplete }: StepAgentKeyProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validatedKey, setValidatedKey] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latestCredentialKey = useRef<string | null>(null);

  if (isComplete) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-3">
          <span className="text-success text-xl">{'\u2713'}</span>
        </div>
        <p className="sam-type-body text-fg-primary font-medium m-0 mb-1">AI agent connected</p>
        <p className="sam-type-caption text-fg-muted m-0">
          You can manage your agent keys in Settings.
        </p>
        <div className="mt-4">
          <Button variant="primary" size="md" onClick={onComplete}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  const getCredentialRequest = (): SaveAgentCredentialRequest | null => {
    if (!selectedAgent || !apiKey.trim()) return null;
    return {
      agentType: selectedAgent,
      credentialKind: 'api-key',
      credential: apiKey.trim(),
    };
  };

  const credentialKey = JSON.stringify(getCredentialRequest());
  latestCredentialKey.current = credentialKey;
  const isValidated = validatedKey === credentialKey;

  const handleValidate = async () => {
    const data = getCredentialRequest();
    if (!data) {
      setError('Select an agent and enter an API key');
      return;
    }
    setValidating(true);
    setValidationMessage(null);
    setError(null);
    const requestKey = credentialKey;
    try {
      const result = await validateAgentCredential(data);
      if (latestCredentialKey.current !== requestKey) return;
      setValidatedKey(requestKey);
      setValidationMessage(result.message);
    } catch (err) {
      if (latestCredentialKey.current !== requestKey) return;
      setValidatedKey(null);
      setError(err instanceof Error ? err.message : 'API key validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    const data = getCredentialRequest();
    if (!data) return;
    if (!isValidated) {
      await handleValidate();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveAgentCredential(data);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const selectedDef = selectedAgent ? AGENT_CATALOG.find((a) => a.id === selectedAgent) : null;

  return (
    <div>
      <h3 className="sam-type-section-heading text-fg-primary m-0 mb-1">Connect your AI agent</h3>
      <p className="sam-type-body text-fg-muted m-0 mb-4">
        SAM runs AI coding agents in cloud workspaces. Which agent do you use?
      </p>

      {error && (
        <div className="mb-3">
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* Agent selection grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {AGENT_CATALOG.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => {
              setSelectedAgent(agent.id);
              setError(null);
              setValidatedKey(null);
              setValidationMessage(null);
            }}
            className={`p-3 rounded-md border text-left transition-colors cursor-pointer bg-surface ${
              selectedAgent === agent.id
                ? 'border-accent ring-1 ring-accent'
                : 'border-border-default hover:border-fg-muted'
            }`}
          >
            <span className="block font-medium text-sm text-fg-primary">{agent.name}</span>
            <span className="block text-xs text-fg-muted mt-0.5">{agent.description}</span>
          </button>
        ))}
      </div>

      {/* API key input */}
      {selectedDef && (
        <div className="mb-4">
          <label htmlFor="agent-api-key" className="block text-sm font-medium text-fg-primary mb-1">
            {selectedDef.name} API Key
          </label>
          <Input
            id="agent-api-key"
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setValidatedKey(null);
              setValidationMessage(null);
            }}
            placeholder={`Paste your ${selectedDef.provider} API key`}
          />
          <a
            href={selectedDef.credentialHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline mt-1 inline-block"
          >
            Where do I get this?
          </a>
        </div>
      )}

      {validationMessage && (
        <div className="mb-3">
          <Alert variant="success">{validationMessage}</Alert>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="self-start text-sm text-fg-muted hover:text-fg-primary bg-transparent border-none cursor-pointer p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Skip this step
        </button>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
          <Button
            variant="secondary"
            size="md"
            onClick={handleValidate}
            disabled={!selectedAgent || !apiKey.trim() || validating || saving}
          >
            {getValidateButtonLabel(validating, isValidated)}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={!selectedAgent || !apiKey.trim() || saving || validating || !isValidated}
          >
            {saving ? 'Saving...' : 'Connect'}
          </Button>
        </div>
      </div>
    </div>
  );
}
