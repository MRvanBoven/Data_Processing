#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt
import matplotlib.patches as ptch

# global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}


def average():
    """
    Calculate average rating per year and save in global data dictionary
    """
    for year in data_dict:
        data_dict[year] = (round(sum(data_dict[year])/len(data_dict[year]), 3))


def get_data():
    """
    Read input csv file, save movie ratings per year in global data dictionary
    """
    with open(INPUT_CSV, newline='') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            data_dict[row["Year"]].append(float(row["Rating"]))


def split(dictionary):
    """
    Split dictionary keys and attributes to separate lists and return these
    """
    keys = []
    attributes = []

    # iterate over dictionary and save key and attribute in separate lists
    for key in dictionary:
        keys.append(key)
        attributes.append(dictionary[key])

    return keys, attributes


def visualize(x_list, y_list):
    """
    Plots given x and y values in a graph, using matplotlib, and shows graph
    """
    plt.plot(x_list, y_list)

    # layout
    plt.suptitle("IMDB Highest Rated Movies - Average Rating per Year (2008-2017)",
                 fontsize=13, fontweight='bold')
    plt.title("By Maud van Boven", fontsize=10)
    plt.xlabel("Year")
    plt.ylabel("Average rating")

    # mark maximum with text and circle
    ymax = max(y_list)
    xmax = x_list[y_list.index(ymax)]
    plt.annotate("BEST YEAR", fontsize=8, color= 'red',
                 xy=(xmax, ymax), xytext=(xmax, ymax + 0.006))
    circle = ptch.Ellipse((xmax, ymax), 0.18, 0.01, fill=False, color='red')
    plt.gca().add_artist(circle)

    plt.show()


if __name__ == "__main__":

    # get data to plot in right format
    get_data()
    average()
    years, averages = split(data_dict)

    # plot in matplotlib
    visualize(years, averages)
