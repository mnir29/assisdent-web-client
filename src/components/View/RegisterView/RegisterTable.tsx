import React, { ChangeEventHandler, MouseEventHandler, useState } from 'react';
import {
    resolveEntityBindings,
    sanitizeBinding,
    tryToGetProp,
} from '../../../utils/utils';
import { DynamicObject } from '../../../types/DynamicObject';
import { Link } from 'react-router-dom';
import { useContextMenu } from '../../../context/ContextMenuProvider';
import { RegisterTableStatusCell } from './RegisterTableStatusCell';

export type RegisterTableProps = {
    columns: string[];
    entities: DynamicObject[];
    bindings: string[][];
    entityType: string | null;
    contextMenu:
        | {
              Text: string;
              Command: DynamicObject;
          }[];
    MetaViewObject: DynamicObject;
};

export const RegisterTable = ({
    columns,
    entities,
    bindings,
    entityType,
    contextMenu,
    MetaViewObject,
}: RegisterTableProps) => {
    const [selectedList, setSelectedList] = useState<Set<string>>(new Set());
    const [favoriteList, setFavoriteList] = useState<Set<string>>(new Set());

    // Opens and updates context menu
    const { openMenu } = useContextMenu();

    const elements = contextMenu?.map((e) => {
        return {
            name: e.Text,
            onClick: () => {
                console.log({ command: e.Command });
            },
        };
    });

    entities.map((entity) => {
        if (entity.IsFavorite) {
            setFavoriteList((oldState) => {
                return new Set(oldState.values()).add(entity.Id);
            });
        }
    });

    const handleCheckToggleOne: ChangeEventHandler<HTMLInputElement> = (
        evt,
    ) => {
        if (evt.target.checked) {
            setSelectedList((oldState) => {
                return new Set(oldState.values()).add(evt.target.name);
            });
        } else {
            setSelectedList((oldState) => {
                oldState.delete(evt.target.name);
                return new Set(oldState.values());
            });
        }
    };

    const handleCheckToggleAll: ChangeEventHandler<HTMLInputElement> = (
        evt,
    ) => {
        if (evt.target.checked) {
            if (entities && entities.length < 1) return;

            setSelectedList((oldState) => {
                const newState = new Set(oldState.values());
                entities.map((entity) => newState.add(entity.Id));
                return newState;
            });
        } else {
            setSelectedList(new Set());
        }
    };

    const handleFavoriteToggle: MouseEventHandler<HTMLButtonElement> = (
        evt,
    ) => {
        const eventTarget = evt.target as HTMLButtonElement;
        const targetEntity = eventTarget.name;
        if (favoriteList.has(targetEntity)) {
            setFavoriteList((oldState) => {
                oldState.delete(targetEntity);
                return new Set(oldState.values());
            });
        } else {
            setFavoriteList((oldState) => {
                oldState.add(targetEntity);
                return new Set(oldState.values());
            });
        }
    };

    const TableHeaders = (
        <thead
            className={`bg-[#d2dce6] text-sm font-semibold text-slate-600 text-left`}
        >
            <tr className={``}>
                <th className="text-center w-8 h-8"></th>
                {Object.hasOwn(
                    MetaViewObject,
                    'IsStateIndicatorExpandedByDefault',
                ) && <th className={`px-2`}>Tila</th>}
                <th className="text-center w-8 h-8 font-normal">
                    <input
                        type="checkbox"
                        onChange={handleCheckToggleAll}
                        disabled={!entities || entities.length === 0}
                    />
                </th>
                {columns?.map((c, idx) => {
                    return (
                        <th className=" px-2 " key={idx}>
                            {c}
                        </th>
                    );
                })}
                <th className={`text-center w-16`}></th>
            </tr>
        </thead>
    );

    const TableRows = entities.map((entity) => {
        const entityBindings = resolveEntityBindings(
            entity,
            bindings,
            entityType,
        );

        const isStateInfo = Object.hasOwn(
            MetaViewObject,
            'IsStateIndicatorExpandedByDefault',
        );

        const RegisterItem =
            MetaViewObject.Children.find(
                (obj: DynamicObject) => obj.TagName === 'RegisterItem',
            ) || null;

        let StateColor = null;

        if (RegisterItem) {
            StateColor = tryToGetProp(
                entity,
                sanitizeBinding(RegisterItem.StateColor),
            );
        }

        return (
            <tr
                key={entity.Id}
                className={`border-b border-gray-300 hover:bg-blue-100/30`}
            >
                <td className="text-center w-8 bg-[#e2e9ee]">⬇️</td>
                {isStateInfo && typeof StateColor === 'string' && (
                    <RegisterTableStatusCell
                        entity={entity}
                        MetaViewObject={MetaViewObject}
                        StateColor={StateColor}
                    />
                )}
                <td className="text-center w-8">
                    <input
                        type="checkbox"
                        name={entity.Id}
                        onChange={handleCheckToggleOne}
                        checked={selectedList.has(entity.Id)}
                    />
                </td>
                {entityBindings.map((bindingValues, idx) => {
                    const isLink = idx === 0;
                    return (
                        <td className="text-left text-sm px-2" key={idx}>
                            {isLink ? (
                                <>
                                    {bindingValues.map((bindingValue, idx) => {
                                        return (
                                            <p key={idx}>
                                                <Link
                                                    to={`/view/${entityType}CardView/${entity.Id}`}
                                                    className={`underline font-semibold cursor-pointer`}
                                                >
                                                    {bindingValue}
                                                    <span
                                                        className={`font-bold`}
                                                    >{`>`}</span>
                                                </Link>
                                            </p>
                                        );
                                    })}
                                </>
                            ) : (
                                bindingValues.map((bindingValue, idx) => {
                                    return <p key={idx}>{bindingValue}</p>;
                                })
                            )}
                        </td>
                    );
                })}
                <td className={`flex justify-around items-center h-full`}>
                    <span
                        className={
                            favoriteList.has(entity.Id)
                                ? `opacity-100`
                                : `opacity-20`
                        }
                    >
                        <button
                            className={`cursor-pointer`}
                            name={entity.Id}
                            onClick={handleFavoriteToggle}
                        >
                            ⭐
                        </button>
                    </span>
                    <span
                        className={`cursor-pointer`}
                        onClick={(e) => openMenu(e, elements)}
                    >
                        🎚️
                    </span>
                </td>
            </tr>
        );
    });

    return (
        <table className="w-full bg-white text-sm">
            {TableHeaders}
            {entities && entities?.length > 0 && <tbody>{TableRows}</tbody>}
        </table>
    );
};
