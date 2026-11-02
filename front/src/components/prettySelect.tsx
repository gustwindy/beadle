export default function PrettySelect({
    hint,
    options,
    setter,
}: {
    hint: string;
    options: string[];
    setter: React.Dispatch<React.SetStateAction<string>>;
}) {
    return (
        <select onChange={(a) => {}}>
            <option disabled>{hint}</option>
            {options.map((v) => {
                return <option key={v}>{v}</option>;
            })}
        </select>
    );
}
