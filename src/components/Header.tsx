import logo from '../../public/images/logo.svg';

interface Props {
    controls: React.ReactNode;
}

export const Header: React.FunctionComponent<Props> = ({ controls }) => {
    return (
        <div className="header">
            <a
                href="https://transitmatters.org"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TransitMatters"
            >
                <img src={logo} className="logo" alt="" />
            </a>
            <div className="title">New Train Tracker</div>
            <div className="subtitle">See where the MBTA's trains are right now</div>
            {controls}
        </div>
    );
};

Header.displayName = 'Header';
