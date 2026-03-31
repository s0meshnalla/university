import { useEffect, useMemo, useRef, useState } from 'react'
import './CustomSelect.css'

function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    className = 'form-select',
    disabled = false,
}) {
    const [open, setOpen] = useState(false)
    const rootRef = useRef(null)

    const selectedOption = useMemo(() => {
        return options.find((option) => String(option.value) === String(value))
    }, [options, value])

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [])

    const handleSelect = (nextValue) => {
        onChange(nextValue)
        setOpen(false)
    }

    return (
        <div ref={rootRef} className="custom-select-wrapper">
            <button
                type="button"
                className={`${className} custom-select-trigger`}
                onClick={() => {
                    if (!disabled) setOpen((prev) => !prev)
                }}
                disabled={disabled}
                aria-expanded={open}
            >
                <span className="custom-select-label">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className={`custom-select-caret ${open ? 'open' : ''}`}>▾</span>
            </button>

            {open && !disabled && (
                <div className="custom-select-menu" role="listbox">
                    {options.map((option) => (
                        <button
                            type="button"
                            key={`${option.value}`}
                            className={`custom-select-option ${
                                String(option.value) === String(value) ? 'selected' : ''
                            } ${option.disabled ? 'disabled' : ''}`}
                            onClick={() => {
                                if (!option.disabled) handleSelect(option.value)
                            }}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CustomSelect
