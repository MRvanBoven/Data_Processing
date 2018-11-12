#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script does something.
"""

import csv
import json
import matplotlib.pyplot as plt
import pandas as pd
import re

INPUT_CSV = 'input.csv'
OUTPUT_JSON = 'output.json'


def boxplot(df, columns, layout_specs):
    """
    Plots a boxplot of the given columns of the given data frame.
    """

    boxplot = df.boxplot(columns)
    layout(layout_specs)

    plt.show()
    plt.clf()

def central_tendency(df, columns):
    """
    Computes central tendency of given columns and returns it in a dictionary.
    """

    ct = {}

    # calculate central tendency of given columns and save in a dictionary
    for column in columns:

        mean = df[column].mean()
        median = df[column].median()
        mode = df[column].mode()[0]
        std = df[column].std()

        # add computen central tendency to dictionary
        ct[column] = {"mean": mean, "median": median, "mode": mode, "std": std}

    return ct

def cleanup(cols, dict_reader):
    """
    Deletes rows lacking info in given columns and removes surplus spaces.
    Takes a DictReader and its columns as input. Returns a list of dictionaries.
    """

    # extract column names
    columns = dict_reader.fieldnames

    # save all complete, and 'de-spaced' dictionaries in new list
    clean_rows = []
    for dict in dict_reader:
        row = {}
        info_complete = True

        # remove surplus spaces and check if rows contain info for given columns
        for column in columns:
            row[column] = dict[column].strip()
            if (not row[column] or row[column] == "unknown") and column in cols:
                info_complete = False

        # save rows with complete information for given columns
        if info_complete:
            clean_rows.append(row)

    return clean_rows

def five_nr_summary(df, columns):
    """
    Computes Five Number Summary of given columns and returns it in dictionary.
    """

    summary = {}

    # calculate five number summary of given columns and add to the summary dict
    for column in columns:

        min = df[column].min()
        quart1 = df[column].quantile(0.25)
        median = df[column].median()
        quart3 = df[column].quantile(0.75)
        max = df[column].max()

        # add computed five number summary of column to dicionary
        summary[column] = {"min": min, "quart1": quart1, "median": median,
                           "quart3": quart3, "max": max}

    return summary

def histogram(df, columns, layout_specs):
    """
    Plots given columns in a histogram.
    """

    for column in columns:

        # find number of rows in column
        nr_rows = df[column].count()

        # plot histogram of column data
        hist = df.hist(bins = nr_rows, column = column, grid = False)

    layout(layout_specs)

    plt.show()
    plt.clf()

def layout(specs):
    """
    Defines plot layout according to given specifications. In case of a
    ValueError the function reverts to standard layout.
    """

    # for specification in specifications:
    #     plt.specification(layout[specification])

    try:
        plt.suptitle(specs["suptitle"],
                     fontsize=specs["suptitle_size"],
                     fontweight=specs["suptitle_weight"])
        plt.title(specs["title"],
                  fontsize=specs["title_size"])
        plt.xlabel(specs["xlabel"])
        plt.ylabel(specs["ylabel"])
    except ValueError:
        pass


if __name__ == "__main__":

    with open(INPUT_CSV, 'r') as infile:

        # extract information from csv input file
        reader = csv.DictReader(infile)

        # remember columns of interest
        country = "Country"
        reg = "Region"
        pop_dens = "Pop. Density (per sq. mi.)"
        inf_mor = "Infant mortality (per 1000 births)"
        gdp = "GDP ($ per capita) dollars"

        # let data contain full info in columns of interst and no surplus spaces
        rows = cleanup([pop_dens, inf_mor, gdp], reader)

        # convert needed data to floats/integers
        for row in rows:
            row[pop_dens] = float(re.sub(",", ".", row[pop_dens]))
            row[inf_mor] = float(re.sub(",", ".", row[inf_mor]))
            row[gdp] = int(row[gdp][:-8])

        # create pandas dataframe
        df = pd.DataFrame(rows)

        # calculate central tendency of GDP and infant mortality data
        cen_ten = central_tendency(df, [gdp, inf_mor])

        # print central tendency of GDP data
        print("\n>", gdp, " central tendency computations")
        for ct in cen_ten[gdp]:
            print(ct, ": ", cen_ten[gdp][ct])

        # specify layout for histogram of GDP data
        spec_layout = {"suptitle": "GDP of Several Countries",
                       "suptitle_size": 13,
                       "suptitle_weight": 'bold',
                       "title": "By Maud van Boven",
                       "title_size": 10,
                       "xlabel": "GDP ($ per capita)",
                       "ylabel": "Frequency"}

        # plot histogram of GDP data in range of -3 std to +3 std around mean
        histogram(df[abs(df[gdp] - cen_ten[gdp]["mean"])
                     <= 3 * cen_ten[gdp]["std"]], [gdp], spec_layout)

        # calculate five number summary of infant mortality data
        fnr_sum = five_nr_summary(df, [inf_mor])

        # print five number summary of infant mortality data
        print("\n>", inf_mor, " five number summary")
        for nr in fnr_sum[inf_mor]:
            print(nr, ": ", fnr_sum[inf_mor][nr])

        # specify layout for boxplot of infant mortality data
        spec_layout = {"suptitle": "Infant Mortality in Several Countries",
                       "suptitle_size": 13,
                       "suptitle_weight": 'bold',
                       "title": "By Maud van Boven",
                       "title_size": 10,
                       "xlabel": "",
                       "ylabel": ""}

        # boxplot of infant mortality data in range -3 std to +3 std around mean
        boxplot(df[abs(df[inf_mor] - cen_ten[inf_mor]["mean"])
                   <= 3 * cen_ten[inf_mor]["std"]], [inf_mor], spec_layout)

        # write data from columns of interest to json format
        json_data = {}
        for row in rows:
            json_data[row[country]] = {reg: row[reg], pop_dens: row[pop_dens],
                                       inf_mor: row[inf_mor], gdp: row[gdp]}
        with open(OUTPUT_JSON, 'w') as outfile:
            json.dump(json_data, outfile)
