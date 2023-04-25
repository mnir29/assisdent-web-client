import { DynamicObject } from '../../../types/DynamicObject';
import { sanitizeBinding, tryToGetProp } from '../../../utils/utils';
import { useState } from 'react';

type RegisterTableStatusCellProps = {
    entity: DynamicObject;
    MetaViewObject: DynamicObject;
    StateColor: string;
};

export const RegisterTableStatusCell = ({
    entity,
    MetaViewObject,
    StateColor,
}: RegisterTableStatusCellProps) => {
    const [isHover, setIsHover] = useState(false);

    const RegisterItem =
        MetaViewObject.Children.find(
            (obj: DynamicObject) => obj.TagName === 'RegisterItem',
        ) || null;

    let StateText: string | string[] | null | DynamicObject = null;

    if (RegisterItem) {
        StateText = tryToGetProp(
            entity,
            sanitizeBinding(RegisterItem.StateText),
        );
    }

    console.log(StateText, StateColor);

    const handleMouseEnter = () => {
        setIsHover(true);
    };

    const handleMouseLeave = () => {
        setIsHover(false);
    };

    return (
        <td
            className={`h-full max-w-[6rem]`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`w-full h-full border-l-8 border-amber-600`}>
                {typeof StateText === 'string' && StateText}
            </div>
        </td>
    );
};
