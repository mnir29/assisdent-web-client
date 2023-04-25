import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getEntitiesForRegisterView } from '../../../services/backend';
import { RegisterTable } from './RegisterTable';
import { DynamicObject } from '../../../types/DynamicObject';
import {
    parseRegisterMetaView,
    parseOrderOptions,
    getRegisterMetaViewAsObject,
} from '../../../utils/Parser';
import { getUserLanguage } from '../../../utils/utils';
import {
    DEFAULT_SHOW_ON_PAGE,
    ShowOnPageOption,
} from '../../../utils/constants';
import { Toolbar } from './Toolbar';
import {
    OrderBy,
    OrderOptionNameObject,
} from '../../../types/ViewTypes/OrderOptions';
import { getEntitySchema } from '../../../temp/SchemaUtils';
import { LoadingSpinner } from '../../LoadingSpinner';

export type DataProps = {
    view: Element;
};

type EntitySearchOptionsType = {
    EntityType: string;
    Skip: number;
    Take: number;
    Filters?: object;
    SubArgs?: object;
    OrderBy: OrderOptionNameObject[] | null;
    PropertiesToSelect: string[];
    IgnoreCalculatedProperties?: boolean;
    SearchLanguage?: string;
    Purpose: string;
    PurposeArgs: {
        ViewName: string;
    };
    IncludeUnfilteredTotalCount?: boolean;
    IncludeFilteredTotalCount?: boolean;
    MissingPropertyIsError?: boolean;
};

export const RegisterView = ({ view }: DataProps) => {
    /**
     * Use State
     */

    const [fetchedEntities, setFetchedEntities] = useState<
        DynamicObject[] | null
    >(null);
    const [selectedOrderOption, setSelectedOrderOption] =
        useState<OrderBy | null>(null);
    const [selectedShowOnPage, setSelectedShowOnPage] =
        useState<ShowOnPageOption>(DEFAULT_SHOW_ON_PAGE);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredTotalCount, setFilteredTotalCount] = useState(0);

    /**
     * Parse XML
     */

    const MetaViewObject = getRegisterMetaViewAsObject(view);

    if (!Object.hasOwn(MetaViewObject, 'EntityType')) {
        console.error(`Couldn't find an entity type at register view`);
        return null;
    }

    // TODO
    console.log(MetaViewObject);

    const EntitySchema = getEntitySchema(MetaViewObject.EntityType);

    if (!EntitySchema) {
        console.error(
            `Did not find Schema for entity '${MetaViewObject.EntityType}'`,
        );
        return null;
    }

    const OrderOptions =
        MetaViewObject.Children.find(
            (child: DynamicObject) => child.TagName === 'OrderOptions',
        ) || null;

    const ApplicationBar =
        MetaViewObject.Children.find(
            (child: DynamicObject) => child.TagName === 'ApplicationBar',
        ) || null;

    const Filters =
        MetaViewObject.Children.find(
            (child: DynamicObject) => child.TagName === 'Filters',
        ) || null;

    const RegisterItem =
        MetaViewObject.Children.find(
            (child: DynamicObject) => child.TagName === 'RegisterItem',
        ) || null;

    let ContextMenu = null;
    let Content = null;
    let ExtraDataContent = null;

    if (RegisterItem) {
        ContextMenu = RegisterItem.Children.find(
            (child: DynamicObject) => child.TagName === 'ContextMenu',
        );

        Content = RegisterItem.Children.find(
            (child: DynamicObject) => child.TagName === 'Content',
        );

        ExtraDataContent = RegisterItem.Children.find(
            (child: DynamicObject) => child.TagName === 'ExtraDataContent',
        );
    }

    const TableRowContextMenuItemsFormatted: {
        Text: string;
        Command: DynamicObject;
    }[] = [];

    if (ContextMenu) {
        for (const MenuItem of ContextMenu.Children) {
            const Text: string = MenuItem.Text;
            if (Text === null) continue;
            const Command: DynamicObject = MenuItem.Children;
            TableRowContextMenuItemsFormatted.push({ Text, Command });
        }
    }

    const isOrderOptions = OrderOptions !== null;
    let orderBy: OrderBy[] = [];
    if (OrderOptions) {
        orderBy = parseOrderOptions(OrderOptions, EntitySchema);
        !selectedOrderOption && setSelectedOrderOption(orderBy[0] || null);
    }

    let testHeaders: string[] = [];
    let testBindings: DynamicObject[][] = [];

    let testTableObject: {
        headers: string[];
        columns: DynamicObject[][];
        bindings: string[][];
    } = {
        headers: [],
        columns: [],
        bindings: [],
    };

    if (Content) {
        Content.Children.forEach((column: DynamicObject) => {
            if (column.TagName === 'Group') {
                testTableObject.headers.push(column.ColumnHeader);
                const temp: DynamicObject[] = [];
                if (column.Children.length > 0) {
                    column.Children.forEach((child: DynamicObject) => {
                        temp.push(child);
                    });
                }
            }
        });
    }

    const { columns, bindings } = parseRegisterMetaView(view);

    /**
     * Event handling
     */

    const doMutate = (EntitySearchOptions?: EntitySearchOptionsType) => {
        mutation.mutate(EntitySearchOptions || buildEntitySearchOptions());
    };

    const handleSelectOrderBy = (option: OrderBy) => {
        setSelectedOrderOption(() => {
            return JSON.parse(JSON.stringify(option));
        });
    };

    const isSelectedShowOnPage = (num: ShowOnPageOption) => {
        return selectedShowOnPage === num;
    };

    const handleSelectShowOnPage = (num: ShowOnPageOption) => {
        setSelectedShowOnPage(num);
    };

    /**
     * Mutations
     */

    const buildEntitySearchOptions = (): EntitySearchOptionsType => ({
        EntityType: MetaViewObject.EntityType,
        Skip: selectedShowOnPage * (currentPage - 1),
        Take: selectedShowOnPage,
        //Filters: {},
        //SubArgs: {},
        OrderBy: selectedOrderOption && [
            ...selectedOrderOption.OrderBy.OrderOptionNames,
        ],
        PropertiesToSelect: [],
        IgnoreCalculatedProperties: false,
        SearchLanguage: getUserLanguage(),
        Purpose: 'Register',
        PurposeArgs: {
            ViewName: MetaViewObject.Name,
        },
        IncludeUnfilteredTotalCount: true,
        IncludeFilteredTotalCount: true,
        //MissingPropertyIsError: true,
    });

    const mutation = useMutation({
        mutationFn: getEntitiesForRegisterView,
        onSuccess: (data) => {
            setFetchedEntities(data.Results);
            setFilteredTotalCount(data.FilteredTotalCount);
        },
    });

    useEffect(() => {
        doMutate();
    }, [selectedOrderOption, selectedShowOnPage]);

    const TestHeaders = () => {
        const isStateInfo = Object.hasOwn(MetaViewObject, 'StateText');
        let StateText = null;
        let StateColor = null;
        let InfoText = null;
        if (isStateInfo) {
            StateText = MetaViewObject.StateText;
            StateColor = `border-l-4 border-[${MetaViewObject.StateColor}]`;
            InfoText = MetaViewObject.InfoText;
        }

        return (
            <thead className={`bg-[#d2dce6]`}>
                <tr>
                    <th>asdf</th>
                    {isStateInfo && (
                        <th className={`${StateColor}`}>{StateText}</th>
                    )}
                </tr>
            </thead>
        );
    };

    /**
     * Render
     */

    return (
        <>
            {mutation.isLoading && <LoadingSpinner />}
            {fetchedEntities && fetchedEntities.length > 0 && (
                <>
                    <Toolbar
                        isSelectedShowOnPage={isSelectedShowOnPage}
                        handleSelectShowOnPage={handleSelectShowOnPage}
                        filteredTotalCount={filteredTotalCount}
                        orderOptions={isOrderOptions ? orderBy : null}
                        selectedOrderOption={selectedOrderOption}
                        handleSelectOrderBy={handleSelectOrderBy}
                    />
                    <RegisterTable
                        columns={columns}
                        entities={fetchedEntities}
                        bindings={bindings}
                        entityType={MetaViewObject.EntityType}
                        contextMenu={TableRowContextMenuItemsFormatted}
                        MetaViewObject={MetaViewObject}
                    />
                </>
            )}
            {fetchedEntities && fetchedEntities.length < 1 && (
                <p className={`text-2xl px-8 py-4`}>No table data</p>
            )}
            <table
                className={`border-collapse border-spacing-1 w-full bg-white mt-4 text-sm`}
            >
                <TestHeaders />
                <tbody>
                    <tr>
                        <td>test</td>
                        <td>test</td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};
