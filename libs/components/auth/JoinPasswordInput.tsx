import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import React, { useCallback, useState } from 'react';

type JoinPasswordInputProps = {
	id: string;
	value: string;
	visible: boolean;
	onToggle: () => void;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	placeholder?: string;
	maxLength?: number;
};

const FADE_MS = 150;

export default function JoinPasswordInput({
	id,
	value,
	visible,
	onToggle,
	onChange,
	onKeyDown,
	placeholder = 'Password',
	maxLength = 12,
}: JoinPasswordInputProps) {
	const [fading, setFading] = useState(false);
	const [pressing, setPressing] = useState(false);

	const handleToggle = useCallback(() => {
		setFading(true);
		window.setTimeout(() => {
			onToggle();
			window.requestAnimationFrame(() => setFading(false));
		}, FADE_MS);
	}, [onToggle]);

	const releasePress = useCallback(() => setPressing(false), []);

	return (
		<div className="form-field__control form-field__control--password">
			<input
				id={id}
				className={`form-field__password-input ${fading ? 'is-fading' : ''}`}
				type={visible ? 'text' : 'password'}
				placeholder={placeholder}
				maxLength={maxLength}
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				autoComplete={visible ? 'off' : 'current-password'}
			/>
			<button
				type="button"
				className={`form-field__toggle ${pressing ? 'is-pressing' : ''}`}
				onClick={handleToggle}
				onMouseDown={() => setPressing(true)}
				onMouseUp={releasePress}
				onMouseLeave={releasePress}
				onBlur={releasePress}
				aria-label={visible ? 'Hide password' : 'Show password'}
				aria-pressed={visible}
			>
				<span
					className={`form-field__toggle-icon ${!visible ? 'is-active' : ''}`}
					aria-hidden
				>
					<VisibilityOutlinedIcon fontSize="small" />
				</span>
				<span className={`form-field__toggle-icon ${visible ? 'is-active' : ''}`} aria-hidden>
					<VisibilityOffOutlinedIcon fontSize="small" />
				</span>
			</button>
		</div>
	);
}
