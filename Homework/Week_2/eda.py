#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script loads in a CSV file, cleans, preprocesses and analyzes the read in
data, and creates a histogram, boxplot, and .json file.
"""

import csv
import json
import matplotlib.pyplot as plt
import pandas as pd
import re

INPUT_CSV = 'input.csv'
OUTPUT_JSON = 'output.json'


def boxplot(df, column, title):
    """
    Plots and shows a boxplot of given column from given data frame, with given
    title.
    """

    # plot boxplot of given column
    df.boxplot(column)

    # layout
    plt.suptitle(title, fontsize=13, fontweight='bold')
    plt.title("By Maud van Boven", fontsize=10)

    plt.show()
    plt.clf()


def central_tendency(df, columns):
    """
    Computes central tendency of given columns and returns it in a dictionary.
    """

    # calculate central tendency of given columns and save in a dictionary
    ct = {}
    for column in columns:
        mean = df[column].mean()
        median = df[column].median()
        mode = df[column].mode()[0]
        ct[column] = {"mean": mean, "median": median, "mode": mode}

    return ct


def cleanup(columns, dict_reader):
    """
    Saves those rows with full info in given columns and removes surplus spaces.
    Returns a list of dictionaries.
    """

    # save 'de-spaced' columns of interest in temporary list
    temp = []
    for dict in dict_reader:
        clean_dict = {}
        for column in columns:
            clean_dict[column] = dict[column].strip()
        temp.append(clean_dict)

    # save rows wit full info in all columns of interest
    clean = [dict for dict in temp if not ("unknown" in dict.values()
                                           or "" in dict.values())]

    return clean

def histogram(df, column, title, xlabel):
    """
    Plots and shows a histogram of given column from given data frame, with
    given layout specifications.
    """

    # plot histogram of given column
    df.hist(bins=df[column].count(), column=column, grid=False)

    # layout
    plt.suptitle(title, fontsize=13, fontweight='bold')
    plt.title("By Maud van Boven", fontsize=10)
    plt.xlabel(xlabel)
    plt.ylabel("Frequency")

    plt.show()
    plt.clf()


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
        cols_int = [country, reg, pop_dens, inf_mor, gdp]

        # get data from columns of interst with full info and no surplus spaces
        clean_rows = cleanup(cols_int, reader)

        infile.close()

    # convert needed data to floats/integers
    for row in clean_rows:
        row[pop_dens] = float(re.sub(",", ".", row[pop_dens]))
        row[inf_mor] = float(re.sub(",", ".", row[inf_mor]))
        row[gdp] = int(row[gdp][:-8])

    # create pandas dataframe
    df = pd.DataFrame(clean_rows, columns=cols_int)

    # remove extreme outliers (outside range of -10std to +10std from mean)
    for col in df.select_dtypes(include="number"):
        df = df[abs(df[col] - df[col].mean()) <= 10 * df[col].std()]

    # compute and print central tendency of GDP data
    cen_ten = central_tendency(df, [gdp])
    print("\n>", gdp, "central tendency")
    for ct in cen_ten[gdp]:
        print(f"{ct}".ljust(6) + f"{round(cen_ten[gdp][ct], 2)}".rjust(10))

    # plot histogram of GDP data
    histogram(df, gdp, "GDP of Several Countries", "GDP ($ per capita)")

    # compute and print five number summary of infant mortality data
    summary = df[inf_mor].describe()[["min", "25%", "50%", "75%", "max"]]
    print("\n>", inf_mor, "five number summary")
    print(summary.to_string(header=None))

    # plot boxplot of infant mortality data
    boxplot(df, inf_mor, "Infant Mortality in Several Countries")

    # write processed data from columns of interest to json file
    with open(OUTPUT_JSON, 'w') as outfile:
        json.dump(df.set_index(country).T.to_dict(), outfile, indent=4)
