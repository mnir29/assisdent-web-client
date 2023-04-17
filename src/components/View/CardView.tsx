import { DynamicObject } from '../../types/DynamicObject';
import { ErrorPage } from '../ErrorPage';
import {
    getEntityData,
    getViewModelData,
    putEntityData,
    saveViewModelData,
} from '../../services/backend';
import { LoadingSpinner } from '../LoadingSpinner';
import { parseCardMetaView } from '../../utils/Parser';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import React, { Key, useEffect, useState } from 'react';
import { ViewHeader } from './ViewHeader';
import {
    getUserLanguage,
    resolveCardBindings,
    sanitizeBinding,
} from '../../utils/utils';
import {
    getEntityPropertiesSchema,
    getEntitySchema,
} from '../../temp/SchemaUtils';
import { List } from './List';
import { TranslationList } from './TranslationList';
import { SectionHeading } from './SectionHeading';
import Button from '../Button';
import { mapObjectPaths } from '../../utils/mapUtils';
import {
    checkIfObjectHasNestedProperty,
    findValueFromArrayOfNestedObjects,
} from '../../utils/objectUtils';
import {
    commonFieldsReducer,
    getAssociationType,
    mapAssociationTypePatchCommands,
} from '../../utils/associationUtils';

export type DataProps = {
    view: Element;
};

type ElementAttributesType = {
    __id: string;
    [index: string]: string;
};

type CardElementType = {
    name: 'Group' | 'List' | 'Element';
    attributes: ElementAttributesType;
    [index: string]: unknown;
};

// Old way to update card view data
/*type putDataOptionsType = {
    EntityType: string | null;
    Patch: DynamicObject;
    PropertiesToSelect: Array<string>;
};*/

type saveViewModelOptionsType = {
    ViewName: string | null;
    ViewModelData: DynamicObject;
    ArgumentType: string;
};

export const CardView = ({ view }: DataProps) => {
    const [cardData, setCardData] = useState<DynamicObject | null>(null);
    const [changedValues, setChangedValues] = useState<Array<DynamicObject>>(
        [],
    );

    // const { viewId } = useParams();
    const { Id } = useParams();

    const parsedCardMetaView = parseCardMetaView(view);
    const argumentType = view.getAttribute('ArgumentType');
    const userLanguage = getUserLanguage();
    const argument = {
        Id: Id,
    };
    const viewName = view.getAttribute('Name');
    const EntityType = view.getAttribute('EntityType');
    const EntityPropertySchema = getEntityPropertiesSchema(EntityType);
    const Header = view.getAttribute('Header');
    let resolvedHeader: string | null;

    if (Header?.includes('{')) {
        resolvedHeader =
            cardData &&
            Header &&
            (resolveCardBindings(cardData, Header) as string);
    } else {
        resolvedHeader = Header;
    }

    const SubHeader = view.getAttribute('SubHeader');
    let resolvedSubHeader: string | null;

    if (SubHeader?.includes('{')) {
        resolvedSubHeader =
            cardData &&
            SubHeader &&
            (resolveCardBindings(cardData, SubHeader) as string);
    } else {
        resolvedSubHeader = SubHeader;
    }

    // Data structure for possible exceptions like Translations table
    const exceptionElements = new Set<string>();
    const ExceptionEntityTypes = new Set([
        'Translation',
        'TranslationCollection',
    ]);

    const entityPropertiesAndTypes = new Map<string, string>();

    // Find possible known exceptions from Schema
    if (EntityPropertySchema) {
        Object.entries(EntityPropertySchema as DynamicObject).forEach(
            (property) => {
                const key = property[0];
                const val = property[1];

                if (
                    val.Type === 'List' &&
                    val.SubType &&
                    ExceptionEntityTypes.has(val.SubType.Type)
                ) {
                    exceptionElements.add(key);
                }

                entityPropertiesAndTypes.set(key, val.Type);
            },
        );
    }

    const getPath = (bindingExpression: string) => {
        const path = bindingExpression
            .replace('{Binding ', '')
            .replace('}', '');
        return path.split('.');
    };

    const viewModelSearchOptions = {
        ViewName: viewName,
        ArgumentType: argumentType,
        Argument: argument,
        SearchLanguage: userLanguage,
        AdditionalPropertiesToSelect: [],
    };

    const mutation = useMutation({
        mutationFn: getViewModelData,
        onError: (error) => {
            console.log('error :>> ', error);
        },
        onSuccess: (apiData) => {
            console.log('apiData :>> ', JSON.stringify(apiData?.ViewModelData));
            if (apiData) setCardData(apiData.ViewModelData);
        },
    });

    // Old way to update card view data
    /*    const putData = useMutation({
        mutationFn: putEntityData,
        onError: (error) => {
            console.log('error :>> ', error);
        },
        onSuccess: (apiData) => {
            console.log('apiData :>> ', apiData);
        },
    });*/

    const saveData = useMutation({
        mutationFn: saveViewModelData,
        onError: (error) => {
            console.log('error :>> ', error);
        },
        onSuccess: (apiData) => {
            console.log('apiData :>> ', apiData);
        },
    });

    useEffect(() => {
        mutation.mutate(viewModelSearchOptions);
    }, []);

    const saveChanges = async () => {
        // We add proper patch commands to objects if necessary
        const changedValuesWithPatchCommands =
            mapAssociationTypePatchCommands(changedValues);

        // console.log('changedValuesCopy', changedValuesWithPatchCommands);

        const reducedChangedValues = changedValuesWithPatchCommands.reduce(
            commonFieldsReducer,
            {},
        );

        // console.log('reducedChangedValues', reducedChangedValues);

        // Old way to update card view data
        /*        const propertiesToSelect = mapObjectPaths(reducedChangedValues);
        console.log('propertiesToSelect', propertiesToSelect);
        const putDataOptions: putDataOptionsType = {
            EntityType: EntityType,
            Patch: {
                ...reducedChangedValues,
                Id: Id,
            },
            PropertiesToSelect: propertiesToSelect,
        };
        console.log(putDataOptions);
        await putData.mutate(putDataOptions);*/

        const saveViewModelOptions: saveViewModelOptionsType = {
            ViewName: viewName,
            // TODO is ArgumentType always in this format?
            ArgumentType: `Edit${viewName}Argument`,
            ViewModelData: {
                Entity: {
                    ...reducedChangedValues,
                    Id: Id,
                },
            },
        };

        console.log('saveViewModelOptions', saveViewModelOptions);
        await saveData.mutate(saveViewModelOptions);
        await mutation.mutate(viewModelSearchOptions);
        setChangedValues([]);
    };

    const cancelChanges = () => {
        setChangedValues([]);
    };

    const PrintList = ({ element }: { element: DynamicObject }) => {
        if (cardData === null) return null;
        return <List xmlElementTree={element} listData={cardData} />;
    };

    const PrintElement = ({ element }: { element: DynamicObject }) => {
        const cardDetails = resolveCardBindings(
            cardData,
            element.attributes.Value,
        );

        const propertyArray = sanitizeBinding(element.attributes.Value)
            .split('Entity.')[1]
            .split('.');
        const changedValue = findValueFromArrayOfNestedObjects(
            propertyArray,
            changedValues,
        );

        const [elementValue, setElementValue] = useState(
            changedValue || cardDetails?.toString(),
        );

        const updateChangedTextInputValue = (
            valueString: string,
            key: string,
            value: string,
        ) => {
            const newChangedValues = [...changedValues];

            // From the binding string (valueString) we get the path to the property
            const keysArray = sanitizeBinding(valueString)
                .split('Entity.')[1]
                .split('.');
            const valueObj: DynamicObject = {};
            let currentObj = valueObj;

            // FIXME Special case: PatientInvoicingAddress can not be updated currently
            if (keysArray[0] === 'PatientInvoicingAddress') {
                return;
            }

            // Get the association type from the schema
            const propertySchemaObj = EntityPropertySchema?.[keysArray[0]];
            const associationType = getAssociationType(propertySchemaObj);

            // We carry the association type in the object to be able to use correct patch commands later
            keysArray.forEach((key, index) => {
                if (index === 0) {
                    currentObj.associationType = associationType;
                }
                if (index === keysArray.length - 1) {
                    currentObj[key] = value;
                } else {
                    currentObj[key] = {};
                    currentObj = currentObj[key];
                }
            });

            // Existing objects will be just updated, new objects will be added
            const existingObject = newChangedValues.findIndex((obj) => {
                return checkIfObjectHasNestedProperty(obj, keysArray);
            });
            if (existingObject > -1) {
                newChangedValues[existingObject] = valueObj;
            } else {
                newChangedValues.push(valueObj);
                const isNewAssociation = newChangedValues.find((item) => {
                    return Object.hasOwn(item, keysArray[0]);
                });
                if (associationType && isNewAssociation) {
                    newChangedValues[newChangedValues.length - 1][
                        keysArray[0]
                    ].Id = cardData?.Entity[keysArray[0]]?.Id;
                }
            }

            console.log('newChangedValues :>> ', newChangedValues);
            setChangedValues(newChangedValues);
        };

        const updateInputValue = (value: string) => {
            setElementValue(value);
        };

        const sanitizedBinding = sanitizeBinding(element.attributes.Value);
        const woEntity = sanitizedBinding.replace('Entity.', '');
        if (entityPropertiesAndTypes.get(woEntity) === 'Boolean') {
            return (
                <div className={`flex flex-col lg:flex-row lg:gap-32`}>
                    <label
                        htmlFor={element.attributes.Identifier}
                        className={`text-sm font-semibold text-ad-grey-800 flex items-center lg:w-1/4`}
                    >
                        {element.attributes.Caption}
                    </label>
                    <input
                        id={element.attributes.Identifier}
                        type={`checkbox`}
                        checked={cardDetails?.toString() === 'true'}
                        onChange={() => {
                            console.log(
                                `checkbox clicked: ${element.attributes.Caption}`,
                            );
                        }}
                    />
                </div>
            );
        }

        if (cardDetails && entityPropertiesAndTypes.get(woEntity) === 'Date') {
            return (
                <div className={`flex flex-col lg:flex-row lg:gap-32`}>
                    <label
                        htmlFor={element.attributes.Identifier}
                        className={`text-sm font-semibold text-ad-grey-800 flex items-center lg:w-1/4`}
                    >
                        {element.attributes.Caption}
                    </label>
                    <input
                        id={element.attributes.Identifier}
                        type={`text`}
                        defaultValue={new Date(
                            cardDetails.toString(),
                        ).toLocaleString('fi-FI', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                        })}
                        className={`flex-1 max-h-12 border border-ad-grey-300 rounded-sm px-2 py-1 hover:border-ad-primary focus:border-ad-primary active:border-ad-primary focus:outline-none`}
                    />
                </div>
            );
        }

        const isCardDetailsNull =
            cardDetails === null || cardDetails === undefined;

        const isElementException = getPath(element.attributes.Value).find(
            (subPath) => exceptionElements.has(subPath),
        );

        if (isElementException) {
            if (!Array.isArray(cardDetails) || cardDetails.length === 0)
                return null;

            return (
                <div className={`basis-full my-8 col-span-2`}>
                    <h2 className={`text-lg mb-2 uppercase text-ad-grey-700`}>
                        {element.attributes.Caption}
                    </h2>
                    <TranslationList translations={cardDetails} />
                </div>
            );
        }

        return (
            <>
                {!isCardDetailsNull && !Array.isArray(cardDetails) && (
                    <div className={`flex flex-col lg:flex-row lg:gap-32`}>
                        <label
                            htmlFor={element.attributes.Identifier}
                            className={`text-sm font-semibold text-ad-grey-800 flex items-center lg:w-1/4`}
                        >
                            {element.attributes.Caption}
                        </label>
                        <input
                            id={element.attributes.Identifier}
                            type={typeof cardDetails}
                            value={elementValue}
                            className={`flex-1 max-h-12 border border-ad-grey-300 rounded-sm px-2 py-1 hover:border-ad-primary focus:border-ad-primary active:border-ad-primary focus:outline-none`}
                            onBlur={(e) => {
                                e.preventDefault();
                                if (elementValue) {
                                    updateChangedTextInputValue(
                                        element.attributes.Value,
                                        element.attributes.Identifier,
                                        elementValue,
                                    );
                                }
                            }}
                            onChange={(e) => {
                                e.preventDefault();
                                updateInputValue(e.target.value);
                            }}
                        />
                    </div>
                )}
            </>
        );
    };

    const MapElements = ({
        elements,
    }: {
        elements: Array<CardElementType>;
    }) => {
        return (
            <>
                {elements.map((element: CardElementType) => {
                    if (element.name === 'Group')
                        return (
                            <PrintGroup
                                group={element}
                                key={element.attributes['__id'] as Key}
                            />
                        );
                    else if (element.name === 'List') {
                        return (
                            <PrintList
                                key={element.attributes['__id'] as Key}
                                element={element}
                            />
                        );
                    } else if (element.name === 'Element')
                        return (
                            <PrintElement
                                key={element.attributes['__id'] as Key}
                                element={element}
                            />
                        );
                    else {
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

    const PrintGroup = ({ group }: { group: DynamicObject }) => {
        const [isContentHidden, setIsContentHidden] = useState(false);

        return (
            group.children?.length && (
                <>
                    {group.attributes.Caption && (
                        <SectionHeading
                            onClick={() => setIsContentHidden(!isContentHidden)}
                        >
                            {group.attributes.Caption}
                        </SectionHeading>
                    )}

                    {!isContentHidden && (
                        <MapElements elements={group.children} />
                    )}
                </>
            )
        );
    };

    const constructCardView = (parsedCardMetaView: DynamicObject) => {
        return (
            <>
                {resolvedHeader && (
                    <ViewHeader
                        header={resolvedHeader.toString()}
                        subHeader={resolvedSubHeader?.toString()}
                    />
                )}
                {parsedCardMetaView && (
                    <div className="px-8 grid lg:grid-cols-2 gap-y-2 gap-x-64 pb-16 lg:max-w-[90%]">
                        {parsedCardMetaView.children.map(
                            (XmlNode: DynamicObject) => {
                                if (XmlNode.name === 'Group') {
                                    return (
                                        <PrintGroup
                                            group={XmlNode}
                                            key={XmlNode.attributes.__id}
                                        />
                                    );
                                }
                            },
                        )}
                    </div>
                )}
            </>
        );
    };

    return (
        <>
            {mutation.isError && <ErrorPage />}
            {mutation.isLoading && <LoadingSpinner />}
            {mutation.isSuccess &&
                cardData &&
                constructCardView(parsedCardMetaView)}
            {/*TODO just temporary buttons here*/}
            <Button
                onClick={() => cancelChanges()}
                disabled={changedValues.length === 0}
            >
                Peruuta muutokset
            </Button>
            <Button
                onClick={() => saveChanges()}
                disabled={changedValues.length === 0}
            >
                Tallenna muutokset
            </Button>
        </>
    );
};
