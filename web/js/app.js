/* globals React, $, console */

"use strict";

/**
 * BookInfoButton class (the small green button next to the book icon).
 */
var BookInfoButton = React.createClass({
    
  render: function () {
      var btnClass = "btn btn-primary book-info";
      if (this.props.disabled) btnClass += " disabled";

      return (
          <button type="button" 
                  className={btnClass}
                  >{this.props.label}</button>);
  }
});

/**
 * SortingHat class (the row of button to sort the preview list).
 */
var SortingHat = React.createClass({
    
    /**
     * This function is called in response to user interacting
     * with the sorting buttons.
     */
    sort: function (event) {
        if (event.target != this.selected) {
            this.selected = event.target;
            $(React.findDOMNode(this)).trigger(
                "sort", $(event.target).text());
        }
    },
    render: function () {
        function makeLabels (sort) {
            return ["by price", "by date", "alphabetically"].map(
                function (label) {
                    return (
                        <button key={label}
                          type="button"
                          onClick={sort}
                          className="btn btn-sm">{label}</button>);
                });
        }
        return (
            <div className="col-pull-lg-3">
              <div className="btn-group sorting-hat">
                {makeLabels(this.sort)}
              </div>
            </div>
        );
    }
});

/**
 * BookContainer class (the box containing the entire book preview).
 */
var BookContainer = React.createClass({
    
    /**
     * This function is called in response to user submitting the
     * search query
     */
    select: function (event) {
        $(React.findDOMNode(this)).trigger("select", this.props.data);
    },
    render: function () {
        return (
            <li>
              <div className="container book-container">
                <div className="row book">
                  <div className="col-lg-9 no-padding white">
                    <div className="book-icon-placeholder"
                         onClick={this.select}>
                      <img className="book-icon desaturate"
                           src={this.props.thumb}/>
                    </div>
                  </div>
                  <div className="col-pull-lg-1">
                    <div className="book-info">
                      <div className="btn-group-vertical">
                        <div className="book-info">
                          <div className="btn-group-vertical">
                            <BookInfoButton label={this.props.country}/>
                            <BookInfoButton label={this.props.price}/>
                            <BookInfoButton label="EPUB"
                              disabled={this.props.epub}/>
                            <BookInfoButton label="PDF"
                              disabled={this.props.pdf}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>);
    }
});

/**
 * PreviewList class (the list of BookContainers).
 */
var PreviewList = React.createClass({
    
    /**
     * This function is called in response to user submitting the
     * search query
     */
    formatPrice: function (listPrice) {
        switch ((listPrice || {}).currencyCode || "NA") {
        case "USD": return "$" + listPrice.amount;
        case "EUR": return listPrice.amount + "€";
        case "ILS": return listPrice.amount + "₪";
        case "NA": return "NA";
        default: return listPrice.amount + " " + listPrice.currencyCode;
        }
    },
    render: function () {
        var that = this;
        return (
            <div className="row middle-row shadow">
              <div className="col-lg-10">
                <ul className="list-inline">
                  {this.props.previews.map(function (data) {
                    return (
                        <BookContainer key={data.id}
                             thumb={data.volumeInfo.imageLinks.thumbnail}
                             country={data.saleInfo.country}
                             epub={data.accessInfo.epub.isAvailable}
                             pdf={data.accessInfo.pdf.isAvailable}
                             price={that.formatPrice(data.saleInfo.listPrice)}
                             data={data}
                          />
                    );
                  })}
                </ul>
              </div>
            </div>);
    }
});

/**
 * Header (the topmost row of the page).
 */
var Header = React.createClass({
    render: function () {
        return (
            <div className="row top-row">
              <div className="col-lg-9">
                <h6 className="bevel">Book search</h6>
              </div>
              <SortingHat/>
            </div>);
    }
});

/**
 * BookDetails class (displays the information for selected book).
 */
var BookDetails = React.createClass({
    
    /**
     * This function produces a row of five stars.  Stars are filled
     * if they closer to the left side of the row than the rating of the
     * book and hollow otherwise.  The rating is rounded up.
     */
    renderRating: function () {
        var result = "", rating = this.props.rating;
        for (var i = 0; i < 5; i++)
            result += i < rating ? "★" : "☆";
        return result;
    },
    
    /**
     * This function produces ISBN.
     */
    formatISBN: function () {
        return this.props.isbn ? "ISBN: " + this.props.isbn : "";
    },

    /**
     * This function produces description for the book (note, this
     * will create HTML from the description we've received from elsewhere).
     */
    createDescription: function () {
        return { __html: this.props.description };
    },
    
    render: function () {
        return (
            <div className="col-lg-pull-4 no-padding">
              <div className="row">
                <h2>{this.props.title}</h2>
                <h3>{this.props.subtitle}</h3>
                {this.props.authors.map(function (author) {
                    return <h4 key={author}
                             className="author">{author}</h4>;
                })}
                <p className="description"
                   dangerouslySetInnerHTML={this.createDescription()}/>
              </div>
              <div className="row medium-dark">
                <h4 className="right-aligned right-padded"
                   >{this.props.publisher}</h4>
                <h4 className="right-aligned right-padded"
                   >{this.formatISBN()}</h4>
                <h5 className="right-aligned right-padded"
                   >{this.props.date}</h5>
              </div>
              <div className="row dark">
                <h4 id="ranking" className="right-aligned right-padded"
                  >{this.renderRating()}</h4>
              </div>
            </div>);
    }
});

/**
 * Plot class (this class renders the Flot applet).
 */
var Plot = React.createClass({

    /**
     * Actually render the plot.
     */
    renderPlot: function () {
        function rhombus(ctx, x, y, radius, shadow) {
            ctx.moveTo(x - radius, y);
            ctx.lineTo(x, y - radius);
            ctx.lineTo(x + radius, y);
            ctx.lineTo(x, y + radius);
            ctx.lineTo(x - radius, y);
        }
        if (this.props.data.bars.length) {

            $.plot("#plot", this.props.data.bars, {
                series: {
                    points: {
                        radius: 10,
                        lineWidth: 0,
                        show: true,
                        fill: 0.9,
                        symbol: rhombus,
                        fillColor: false
                    }
                },
			    grid: {
				    backgroundColor: "#EEE2E6",
				    borderWidth: { top: 4, right: 4, bottom: 4, left: 4 },
                    borderColor: "#A99C9A"
			    },
                xaxis: {
                    labelWidth: 112,
                    labelHeight: 112,
                    reserveSpace: true,
                    ticks: this.props.data.ticks
                },
                yaxis: {
                    min: this.props.data.range[0],
                    max: this.props.data.range[1]
                }
            });
        } else { $("#plot").empty(); }
    },

    /**
     * Generate description for the plot.
     */
    describe: function () {
        if (this.props.data.bars.length)
            return "Books found by the year they were published.";
        return "";
    },
    
    render: function () {
        return (
            <div className="col-lg-12">
              <div className="row">
                <div id="plot"/>
              </div>
              <div className="row">
                <div className="left-padded">
                  <p>{this.describe()}</p>
                </div>
              </div>
            </div>);
    },
    componentDidUpdate: function () { this.renderPlot(); },
    
    componentDidMount: function () { this.renderPlot(); }
});

var ModalMixin = {
    show: function (message) {
        React.render((
            <div className="modal-body">
              <div className="alert alert-danger">
                <div className="row">
                  <div className="col-lg-8">
                    <p className="danger">{message}</p>
                  </div>
                  <div className="col-lg-4">
                    <button type="button" className="btn"
                        onClick={this.hide}>Dismiss</button>
                  </div>
                </div>
              </div>
            </div>),
            $("#message").modal("show").get(0));
    },
    hide: function () {
        React.unmountComponentAtNode($("#message").modal("hide").get(0));
    }
};

/**
 * GViewer class (creates and manages the Google Book Viewer component).
 */
var GViewer = React.createClass({

    mixins: [ModalMixin],
    
    getInitialState: function () { return { viewer: null }; },

    /**
     * Fetches the JavaScript required to run Google Book Viewer.
     */
    initGapi: function () {
        var that = this;
        // If I don't use callback, this code will use document.write...
        google.load("books", "0", { callback: _.identity });
    },
    
    render: function () {
        return (
            <div className="row plot-row">
              <div id="gviewer-wrapper">
                <div id="gviewer"/>
              </div>
            </div>);
    },
    
    componentDidMount: function () { this.initGapi(); },

    /**
     * Nothing interesting here yet.  I'm not sure we are at all interested
     * to know about little misfortunes the viewer encounters.
     */
    loadFail: function (data) {
        if (this.props.selected) 
            this.show("Google Book Viewer Failed to load: " +
                this.props.selected);
    },

    /**
     * Nothing interesting here yet.  For some reason the viewer may
     * sometimes refuse to work unless given a callback.
     */
    loadSuccess: function (data) {
        console.log("loaded: " + this.props.selected);
    },
    
    componentDidUpdate: function () {
        var elt = $("#gviewer");
        elt.empty();
        var viewer = new google.books.DefaultViewer(elt.get(0));
        viewer.load(this.props.selected, this.loadFail, this.loadSuccess);
    }
});

/**
 * SearchBox class (displays the search input and the button).
 */
var SearchBox = React.createClass({
    
    /**
     * This function is called in response to user interacting with the
     * search box.
     */
    search: function () {
        var val = $("#search").val();
        if (val) $(React.findDOMNode(this)).trigger("search", val);
    },
    
    /**
     * This function is called when users type anything into the
     * search input control.
     */
    keyup: function (event) {
        if (event.which == 13) this.search();
    },
    
    render: function () {
        return (
            <div className="row plot-row">
              <div className="col-lg-10">
                <div className="form-group pad-more">
                  <input type="text" 
                         className="form-control"
                         id="search"
                         onKeyUp={this.keyup}
                         placeholder="Search for books"/>
                </div>
              </div>
              <div className="col-lg-2 white pad-more pad-two">
                <button type="submit" 
                        id="submit"
                        className="btn btn-primary"
                        onClick={this.search}>Search</button>
              </div>
            </div>);
    }
});

/**
 * ViewerPane class (generates the white box containing the search box
 * and the Google Viewer control).
 */
var ViewerPane = React.createClass({
    
    render: function () {
        return (
            <div className="col-lg-5 white no-padding">
              <SearchBox/>
              <div className="row plot-row">
                <div className="col-lg-8">
                  <GViewer selected={this.props.selected}/>
                </div>
                  <BookDetails
                    title={this.props.active.title}
                    subtitle={this.props.active.subtitle}
                    description={this.props.active.description}
                    authors={this.props.active.authors}
                    rating={this.props.active.averageRating}
                    publisher={this.props.active.publisher}
                    date={this.props.active.publishDate}
                    isbn={this.props.active.industryIdentifiers[0].identifier}
                    />
              </div>
            </div>);
    }
});

/**
 * ContentPane class (generates the entire middle section of the page,
 * including the ViewerPane and the Plot).
 */
var ContentPane = React.createClass({
    
    render: function () {
        return (
            <div className="row bottom-row light plot-row">
              <ViewerPane
                selected={this.props.selected}
                active={this.props.active}
                />
              <div className="col-lg-7 no-padding">
                <div className="row plot-row medium-dark">
                  <h2 className="light-text">Statistics</h2>
                </div>
                <div className="row plot-row">
                  <Plot data={this.props.plotData}/>
                </div>
              </div>
            </div>);
    }
});

/**
 * BootstrapContainer class (the top-level component).
 * This class is responsible for everything that happens inside this 
 * application.
 */
var BootstrapContainer = React.createClass({
    
    mixins: [ModalMixin],

    defaultActive: function () {
        return {
            title: "", 
            subtitle: "", 
            authors: [], 
            averageRating: 0,
            publisher: "",
            publishDate: "",
            industryIdentifiers: [{ identifier: "" }]
        };
    },
    getInitialState: function () {
        return {
            previews: [],
            selected: "",
            startIndex: 0,
            maxResults: 5,
            active: this.defaultActive()
        };
    },
    
    /**
     * Extracts the title from book description.
     */
    getTitle: function (x) { return (x.volumeInfo || {}).title; },
    
    /**
     * Extracts the publishing date from book description.
     */
    getDate: function (x) {
        return new Date((x.volumeInfo || {}).publishedDate || "0-1-1");
    },

    /**
     * Generates sorters corresponding to the buttons sitting inside
     * the SortingHat.
     */
    sorters: function () {
        function getPrice(x) {
            return ((x.saleInfo || {}).listPrice || {})
                .amount || Number.MAX_VALUE;
        }
        function byPrice(a, b) {
            return getPrice(a) - getPrice(b);
        }
        var byDate = function (a, b) {
            return this.getDate(a) - this.getDate(b);
        }.bind(this);
        var alphabetically = function (a, b) {
            var ta = this.getTitle(a), tb = this.getTitle(b);
            if (ta == tb) return 0;
            if (ta > tb) return 1;
            return -1;
        }.bind(this);
        return {
            "by date": byDate,
            "by price": byPrice,
            "alphabetically": alphabetically
        };
    },

    /**
     * Prepares the data we need to feed to the Plot component.
     */
    preparePlot: function () {
        var result = {}, data;
        result.bars = this.state.previews.map(function (book, i) {
            return {
                color: book.volumeInfo == this.state.active ? "#634A80" : "#7A8065",
                data: [[i, parseInt((book.volumeInfo || {}).publishedDate || "0", 10)]]
            };
        }.bind(this));
        result.ticks = this.state.previews.map(function (book, i) {
            return [i, this.getTitle(book)];
        }.bind(this));
        data = _.pluck(_.pluck(_.pluck(result.bars, "data"), 0), 1);
        result.range = [_.min(data), _.max(data)];
        return result;
    },

    /**
     * Loads the previews for each book returned from the search results.
     */
    repopulateList: function (data) {
        var pending = data.items || [],
            loaded = [], that = this;

        function normalize(data) {
            return $.extend(true, {
                volumeInfo: {
                    imageLinks: { thumbnail: "" },
                    country: "NA",
                    industryIdentifiers: [{}]
                },
                accessInfo: {
                    epub: { isAvailable: false },
                    pdf: { isAvailable: false }
                }
            }, data);
        };
        
        function itemLoadHandler(item, data) {
            pending.splice(pending.indexOf(item));
            loaded.push(normalize(data));
            if (!pending.length)
                that.setState({ previews: loaded });
        }

        function itemErrorHandler(item) {
            pending.splice(pending.indexOf(item));
            if (!pending.length)
                that.setState({ previews: loaded });
        }

        _.each(pending, function (item) {
            $.ajax("https://www.googleapis.com/books/v1/volumes/" + item.id)
            .done(_.partial(itemLoadHandler, item))
            .fail(_.partial(itemErrorHandler, item))
            .fail(that.displayError);
        }.bind(this));
    },

    /**
     * All errors that happen inside this application will be handled here.
     */
    displayError: function (error) { this.show(error); },
    
    /**
     * The (non-existing so far) pagination will happen here.
     */
    updateIndex: function () {
        this.setState({
            startIndex: this.state.startIndex + this.state.maxResults
        });
    },

    /**
     * Unfortunately, React's own events aren't usable, this is why we
     * need to subscribe to events we dispatch somewhere down the DOM
     * tree here, as soon as possible.
     * BUG: It seems like we may accidentally subscribe multiple times.
     */
    initEvents: function () {
        var node = $(React.findDOMNode(this));
        node.on("select", function (event, data) {
            if (data) {
                this.setState({ 
                    selected: "http://books.google.co.il/books?id=" + 
                    data.id + "&pg=PP1#v=onepage",
                    active: data.volumeInfo
                });
            }
        }.bind(this));
        node.on("search", function (event, query) {
            $.ajax({
                url: "https://www.googleapis.com/books/v1/volumes",
                dataType: "json",
                data: {
                    q: query,
                    startIndex: this.state.startIndex,
                    maxResults: this.state.maxResults
                } })
            .done(this.repopulateList)
            .done(this.updateIndex)
            .fail(this.displayError);
            this.setState({
                active: this.defaultActive(),
                selected: "",
                previews: []
            });
        }.bind(this));
        node.on("sort", function (event, criteria) {
            var books = this.state.previews.concat();
            books.sort(this.sorters()[criteria]);
            this.setState({ previews: books });
        }.bind(this));
    },
    
    componentDidUpdate: function () { this.initEvents(); },
    
    componentDidMount: function () { this.initEvents(); },
    
    render: function () {
        return (
            <div className="container-fluid">
              <Header/>
              <PreviewList 
                previews={this.state.previews}
                />
              <ContentPane
                searchHandler={this.searchHandler}
                selected={this.state.selected}
                active={this.state.active}
                plotData={this.preparePlot()}
                />
            </div>
        );
    }
});

React.render(<BootstrapContainer/>, $("#container").get(0));
