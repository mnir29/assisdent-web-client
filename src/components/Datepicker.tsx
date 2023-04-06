export type DatepickerProps = {
    // Optional props
    value?: string;
    disabled?: boolean;
    className?: string;
};

function Datepicker(props: DatepickerProps) {
    const {
        // Optional props
        disabled,
        className,
        value,
    } = props;

    console.log(value)

    return (
        <input
            className={
                'flex-1 max-h-12 border border-ad-grey-300 rounded-sm px-2 py-1 hover:border-ad-primary focus:border-ad-primary active:border-ad-primary focus:outline-none w-full' +
                className
            }
            type="date"
            id="birthday"
            name="birthday"
            disabled={disabled}
            value={value}
        />
    );
}

export default Datepicker;
