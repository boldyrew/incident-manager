import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { chooseOption } from '@/test-utils/select';
import {
  InlineEditableBadgeSelect,
  InlineEditableText,
  InlineEditableTextarea,
} from './InlineEditable';

function deferred() {
  let resolve!: () => void;
  let reject!: (err: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('InlineEditableText', () => {
  it('shows the value and enters edit mode on click', async () => {
    const user = userEvent.setup();
    render(<InlineEditableText value="Phishing" onSave={jest.fn()} label="Title" />);

    await user.click(screen.getByRole('button', { name: 'Edit Title' }));

    const input = screen.getByRole('textbox', { name: 'Title' });
    expect(input).toHaveValue('Phishing');
    expect(input).toHaveFocus();
  });

  it.each(['{Enter}', ' '])('enters edit mode with the keyboard (%s)', async (key) => {
    const user = userEvent.setup();
    render(<InlineEditableText value="Phishing" onSave={jest.fn()} label="Title" />);

    screen.getByRole('button', { name: 'Edit Title' }).focus();
    await user.keyboard(key);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows the empty text when there is no value', () => {
    render(<InlineEditableText value="  " onSave={jest.fn()} emptyText="Nothing yet" />);
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveTextContent('Nothing yet');
  });

  it('uses renderDisplay when provided', () => {
    render(
      <InlineEditableText value="abc" onSave={jest.fn()} renderDisplay={(v) => <b>{v.toUpperCase()}</b>} />,
    );
    expect(screen.getByText('ABC')).toBeInTheDocument();
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<InlineEditableText value="x" onSave={jest.fn()} disabled label="Title" />);

    const trigger = screen.getByRole('button', { name: 'Edit Title' });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('saves the trimmed value on Enter', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<InlineEditableText value="Old" onSave={onSave} label="Title" />);

    await user.click(screen.getByRole('button', { name: 'Edit Title' }));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '  New title  {Enter}');

    expect(onSave).toHaveBeenCalledWith('New title');
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  });

  it('rejects an empty value without calling onSave', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(<InlineEditableText value="Old" onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('This field cannot be empty.')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('closes without saving when the value is unchanged', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(<InlineEditableText value="Same" onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.type(screen.getByRole('textbox'), '  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('cancels with Escape and restores the original value', async () => {
    const user = userEvent.setup();
    render(<InlineEditableText value="Original" onSave={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.type(screen.getByRole('textbox'), ' changed{Escape}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('textbox')).toHaveValue('Original');
  });

  it('cancels with the Cancel button', async () => {
    const user = userEvent.setup();
    render(<InlineEditableText value="Original" onSave={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('disables the controls while saving', async () => {
    const user = userEvent.setup();
    const pending = deferred();
    render(<InlineEditableText value="Old" onSave={() => pending.promise} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.type(screen.getByRole('textbox'), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    pending.resolve();
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  });

  it('stays in edit mode and shows an error when saving fails', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockRejectedValue(new Error('500'));
    render(<InlineEditableText value="Old" onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.type(screen.getByRole('textbox'), '!{Enter}');

    expect(await screen.findByText('Failed to save. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Old!');
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('picks up new props while not editing', () => {
    const { rerender } = render(<InlineEditableText value="v1" onSave={jest.fn()} />);
    rerender(<InlineEditableText value="v2" onSave={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveTextContent('v2');
  });
});

describe('InlineEditableTextarea', () => {
  it('inserts a newline on Enter and saves the untrimmed draft on Ctrl/Cmd+Enter', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<InlineEditableTextarea value="" onSave={onSave} label="Description" />);

    await user.click(screen.getByRole('button', { name: 'Edit Description' }));
    await user.type(screen.getByRole('textbox'), 'line 1{Enter}line 2 ');
    expect(onSave).not.toHaveBeenCalled();

    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(onSave).toHaveBeenCalledWith('line 1\nline 2 ');
  });

  it('allows saving an empty value', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<InlineEditableTextarea value="old" onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByRole('textbox'));
    await user.keyboard('{Meta>}{Enter}{/Meta}');

    expect(onSave).toHaveBeenCalledWith('');
  });

  it('renders multiline values in display mode', () => {
    render(<InlineEditableTextarea value={'a\nb'} onSave={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Edit' }).textContent).toBe('a\nb');
  });
});

describe('InlineEditableBadgeSelect', () => {
  const options = [
    { value: 'OPEN', label: 'Open' },
    { value: 'CLOSED', label: 'Closed' },
  ] as const;

  function setup(props: Partial<React.ComponentProps<typeof InlineEditableBadgeSelect<'OPEN' | 'CLOSED'>>> = {}) {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const getBadgeVariant = jest.fn(() => 'info' as const);
    render(
      <InlineEditableBadgeSelect
        value="OPEN"
        options={[...options]}
        onSave={onSave}
        getBadgeVariant={getBadgeVariant}
        label="Status"
        {...props}
      />,
    );
    return { onSave, getBadgeVariant, user: userEvent.setup() };
  }

  it('shows the option label as a badge', () => {
    const { getBadgeVariant } = setup();
    expect(screen.getByRole('button', { name: 'Edit Status' })).toHaveTextContent('Open');
    expect(screen.getByRole('button', { name: 'Edit Status' })).toHaveAttribute(
      'title',
      'Click to edit status',
    );
    expect(getBadgeVariant).toHaveBeenCalledWith('OPEN');
  });

  it('falls back to the raw value when no option matches', () => {
    setup({ value: 'UNKNOWN' as never });
    expect(screen.getByRole('button', { name: 'Edit Status' })).toHaveTextContent('UNKNOWN');
  });

  it('is not editable when disabled', async () => {
    const { user } = setup({ disabled: true });
    const trigger = screen.getByRole('button', { name: 'Edit Status' });
    expect(trigger).toBeDisabled();
    expect(trigger).not.toHaveAttribute('title');
    await user.click(trigger);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('saves a newly selected option', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('button', { name: 'Edit Status' }));
    await chooseOption(user, screen.getByRole('combobox', { name: 'Status' }), 'Closed');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith('CLOSED');
    await waitFor(() => expect(screen.queryByRole('combobox')).not.toBeInTheDocument());
  });

  it('closes without saving when the selection is unchanged', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('button', { name: 'Edit Status' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows an error when saving fails', async () => {
    const { user, onSave } = setup();
    onSave.mockRejectedValue(new Error('403'));
    await user.click(screen.getByRole('button', { name: 'Edit Status' }));
    await chooseOption(user, screen.getByRole('combobox', { name: 'Status' }), 'Closed');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Failed to save. Please try again.')).toBeInTheDocument();
  });

  it('cancels with the Cancel button and Escape on the trigger', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Edit Status' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit Status' }));
    screen.getByRole('combobox').focus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
