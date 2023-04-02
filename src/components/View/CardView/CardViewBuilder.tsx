import { Key } from 'react';
import { DtoProperty } from '../../../types/DtoProperty';
import { DynamicObject } from '../../../types/DynamicObject';
import { resolveCardBindings } from '../../../utils/utils';
import { CardButton } from './CardButton';
import { CardElement } from './CardElement';
import { CardGroup } from './CardGroup';
import { CardList } from './CardList';
import { CardSearch } from './CardSearch';
import { Editor } from './Editor';
import { CardCustom } from './CardCustom';

type ElementAttributesType = {
    __id: string;
    [index: string]: string;
};

type CardElementType = {
    name:
        | 'Group'
        | 'List'
        | 'Element'
        | 'Search'
        | 'Button'
        | 'Editor'
        | 'TextBlock'
        | 'Separator'
        | 'Custom';
    attributes: ElementAttributesType;
    [index: string]: unknown;
};

export const CardViewBuilder = ({
    elements,
    cardData,
    entityPropertySchema,
}: {
    elements: Array<CardElementType>;
    cardData: DynamicObject | null;
    entityPropertySchema: { [index: string]: DtoProperty } | undefined;
}) => {
    return (
        <>
            {elements.map((element: CardElementType) => {
                switch (element.name) {
                    case 'Group':
                        return (
                            <CardGroup
                                key={element.attributes['__id'] as Key}
                                group={element}
                                cardData={cardData}
                                entityPropertySchema={entityPropertySchema}
                            />
                        );
                    case 'List':
                        return (
                            <CardList
                                key={element.attributes['__id'] as Key}
                                element={element}
                                cardData={cardData}
                            />
                        );
                    case 'Element':
                        return (
                            <CardElement
                                key={element.attributes['__id'] as Key}
                                element={element}
                                cardData={cardData}
                                entityPropertySchema={entityPropertySchema}
                            />
                        );
                    case 'Search':
                        return (
                            <CardSearch
                                key={element.attributes['__id'] as Key}
                                element={element}
                                cardData={cardData}
                            />
                        );
                    case 'Button': {
                        return (
                            <CardButton
                                key={element.attributes['__id'] as Key}
                                element={element}
                                cardData={cardData}
                            />
                        );
                    }
                    case 'Editor': {
                        const content = resolveCardBindings(
                            cardData,
                            element.attributes.Value,
                        );
                        return (
                            <Editor
                                key={element.attributes['__id'] as Key}
                                element={element}
                                content={content?.toString()}
                                placeholder={element.attributes.Caption}
                            />
                        );
                    }
                    case 'TextBlock':
                        return (
                            <p
                                key={element.attributes['__id'] as Key}
                                className="text-ad-grey-400"
                            >
                                {element.attributes.GhostText
                                    ? `${element.attributes.GhostText}`
                                    : ''}
                            </p>
                        );
                    case 'Separator':
                        return <br key={element.attributes['__id'] as Key} />;
                    case 'Custom':
                        return (
                            <CardCustom
                                key={element.attributes['__id'] as Key}
                                element={element}
                                cardData={cardData}
                            />
                        );
                    default:
                        return (
                            <p key={element.attributes['__id'] as Key}>
                                {`Element type ${element.name} not
                                            yet implemented`}
                            </p>
                        );
                }
            })}
        </>
    );
};